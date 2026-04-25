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
    faTrash, faEllipsisV, faBan, faUnlock, faEnvelope, faCircle
} from '@fortawesome/free-solid-svg-icons'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'

const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (minutes < 1) return 'Now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const formatMessageTime = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

const formatDateSeparator = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.floor((today - msgDate) / 86400000)
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
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const getInitialColor = (name) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500']
    return colors[(name || '').charCodeAt(0) % colors.length]
}

const FileAttachment = ({ msg, isMine, theme, onImageClick }) => {
    if (!msg.fileUrl) return null
    const isLight = theme === 'light'
    if (isImageType(msg.fileType)) {
        return (
            <div className="rounded-lg overflow-hidden">
                <img src={msg.fileUrl} alt={msg.fileName || 'Image'} className="max-w-[280px] w-full h-auto max-h-[300px] object-contain cursor-pointer block" onClick={() => onImageClick?.(msg.fileUrl, msg.fileName)} />
            </div>
        )
    }
    return (
        <div className={`flex items-center gap-2.5 mb-1.5 p-2.5 rounded-lg cursor-pointer transition-all ${isMine ? 'bg-blue-700/30 hover:bg-blue-700/40' : (isLight ? 'bg-black/[0.03] hover:bg-black/[0.06]' : 'bg-white/5 hover:bg-white/8')}`} onClick={() => triggerDownload(msg.fileUrl, msg.fileName)}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isMine ? 'bg-blue-500/30' : (isLight ? 'bg-indigo-100' : 'bg-indigo-500/20')}`}>
                <FontAwesomeIcon icon={faFile} className={`text-sm ${isMine ? 'text-blue-200' : 'text-indigo-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isMine ? 'text-white' : ''}`}>{msg.fileName}</p>
                <p className={`text-[10px] ${isMine ? 'text-blue-200' : (isLight ? 'text-gray-400' : 'text-gray-500')}`}>Click to download</p>
            </div>
            <FontAwesomeIcon icon={faDownload} className={`text-xs flex-shrink-0 ${isMine ? 'text-blue-200' : (isLight ? 'text-gray-400' : 'text-gray-500')}`} />
        </div>
    )
}

const ImageLightbox = ({ imageUrl, fileName, onClose }) => {
    if (!imageUrl) return null
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="absolute -top-12 right-0 flex items-center gap-2">
                    <button onClick={() => triggerDownload(imageUrl, fileName)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors" title="Download">
                        <FontAwesomeIcon icon={faDownload} className="text-sm" />
                    </button>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                        <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </button>
                </div>
                <img src={imageUrl} alt={fileName || 'Image'} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" />
            </div>
        </div>
    )
}

const ConfirmDialog = ({ open, icon, iconColor, title, description, confirmText, onCancel, onConfirm, isDark }) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
            <div className={`w-full max-w-sm mx-4 rounded-xl overflow-hidden border ${isDark ? 'bg-[#161616] border-[#2B2B2B] shadow-2xl' : 'bg-white/95 backdrop-blur-md border-slate-200/60 shadow-xl'}`} onClick={e => e.stopPropagation()}>
                <div className={`px-6 pt-6 pb-4 border-b ${isDark ? 'border-[#222]' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? `${iconColor}/10` : `${iconColor}/10`}`}>
                            <FontAwesomeIcon icon={icon} className={`text-base ${iconColor}`} />
                        </div>
                        <div>
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h3>
                            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>{description}</p>
                        </div>
                    </div>
                </div>
                <div className={`flex gap-3 px-6 py-4`}>
                    <button onClick={onCancel} className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-medium transition-all ${isDark ? 'bg-[#1C1C1C] hover:bg-[#222] text-gray-400 border border-[#333]' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 px-4 rounded-lg text-xs font-medium transition-all bg-red-600 hover:bg-red-700 text-white shadow-sm">{confirmText}</button>
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
    const isDark = !isLight

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
        } else { dispatch(clearBlockStatus()) }
    }, [activeConversation?._id, dispatch])
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmojiPicker(false)
            if (msgMenuRef.current && !msgMenuRef.current.contains(e.target)) setMsgMenuId(null)
            if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) setShowHeaderMenu(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = useCallback((value) => {
        setSearchQuery(value)
        if (value.trim().length >= 2) dispatch(searchUsers(value))
        else dispatch(clearSearchResults())
    }, [dispatch])

    const handleSelectConversation = (conv) => { dispatch(setActiveConversation(conv)); setShowMobileChat(true) }
    const handleStartConversation = (targetUser) => { dispatch(getOrCreateConversation({ targetUserId: targetUser._id })); setSearchQuery(''); dispatch(clearSearchResults()); setShowMobileChat(true) }
    const getOtherParticipant = (conv) => conv?.participants?.find(p => p._id?.toString() !== userId) || {}

    const handleSend = (e) => {
        e.preventDefault()
        if ((!messageInput.trim() && !filePreview) || !activeConversation?._id) return
        const payload = { conversationId: activeConversation._id, content: messageInput.trim() }
        if (filePreview) { payload.fileUrl = filePreview.dataUrl; payload.fileName = filePreview.name; payload.fileType = filePreview.type }
        dispatch(sendMessage(payload))
        setMessageInput(''); setFilePreview(null); setShowEmojiPicker(false)
        const other = getOtherParticipant(activeConversation)
        emitStopTyping(activeConversation._id, other._id)
    }

    const handleTyping = (e) => {
        setMessageInput(e.target.value)
        if (!activeConversation) return
        const other = getOtherParticipant(activeConversation)
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
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const handleDeleteMessage = (messageId) => { dispatch(deleteMessageForMe(messageId)); setMsgMenuId(null) }
    const handleDeleteMessageEveryone = (messageId) => { dispatch(deleteMessageForAll(messageId)); setMsgMenuId(null) }
    const handleDeleteForMe = (conversationId) => { setShowHeaderMenu(false); setConfirmDeleteId(conversationId) }
    const confirmDelete = () => { if (confirmDeleteId) dispatch(deleteConversationForMe(confirmDeleteId)); setConfirmDeleteId(null) }
    const handleBlockUserAction = (targetUser) => { setShowHeaderMenu(false); setConfirmBlockUser(targetUser) }
    const confirmBlock = () => { if (confirmBlockUser) dispatch(blockUser({ targetUserId: confirmBlockUser._id })).then(() => dispatch(getBlockedUsers())); setConfirmBlockUser(null) }
    const handleUnblock = (targetUserId) => dispatch(unblockUser(targetUserId))
    const handleSidebarTab = (tab) => { setSidebarTab(tab); if (tab === 'blocked') dispatch(getBlockedUsers()) }

    const shouldShowDateSeparator = (msg, idx) => {
        if (idx === 0) return true
        return new Date(messages[idx - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString()
    }

    const panelBorder = isLight ? 'border-slate-200/60' : 'border-[#2B2B2B]'
    const panelBg = isLight ? 'bg-white/80 backdrop-blur-sm' : 'bg-[#161616]'

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <ImageLightbox imageUrl={lightboxImage?.url} fileName={lightboxImage?.name} onClose={() => setLightboxImage(null)} />
            <ConfirmDialog open={!!confirmDeleteId} icon={faTrash} iconColor="text-red-500" title="Delete chat?" description="All messages will be removed from your view." confirmText="Delete" onCancel={() => setConfirmDeleteId(null)} onConfirm={confirmDelete} isDark={isDark} />
            <ConfirmDialog open={!!confirmBlockUser} icon={faBan} iconColor="text-red-500" title={`Block ${confirmBlockUser?.username}?`} description="They won't be able to send you messages." confirmText="Block" onCancel={() => setConfirmBlockUser(null)} onConfirm={confirmBlock} isDark={isDark} />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-indigo-50' : 'bg-indigo-900/20'}`}>
                        <FontAwesomeIcon icon={faEnvelope} className={`text-xs ${isLight ? 'text-indigo-500' : 'text-indigo-400'}`} />
                    </div>
                    <h1 className={`text-2xl font-semibold ${isLight ? light.heading : dark.heading}`}>Messages</h1>
                </div>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Send and receive messages with other users</p>
            </div>

            {/* Chat Container */}
            <div className={`flex rounded-xl overflow-hidden border ${panelBg} ${panelBorder}`} style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>

                {/* ─── Sidebar ─── */}
                <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[320px] lg:w-[340px] flex-shrink-0 border-r ${panelBorder}`}>
                    {/* Sidebar Header */}
                    <div className={`px-4 py-3.5 border-b ${panelBorder}`}>
                        <div className="flex gap-1 mb-3">
                            {['chats', 'blocked'].map(tab => (
                                <button key={tab} onClick={() => handleSidebarTab(tab)}
                                    className={`flex-1 py-2 text-[11px] font-semibold rounded-lg transition-all ${sidebarTab === tab
                                        ? (isLight ? 'bg-indigo-500 text-white shadow-sm' : 'bg-indigo-600 text-white')
                                        : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#222]')}`}>
                                    {tab === 'chats' ? 'Chats' : 'Blocked'}
                                </button>
                            ))}
                        </div>
                        {sidebarTab === 'chats' && (
                            <>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                    <input type="text" placeholder="Search users to chat..." value={searchQuery} onChange={e => handleSearch(e.target.value)}
                                        className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100' : 'bg-[#1A1A1A] border-[#333] text-gray-300 placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900/30'}`} />
                                </div>
                                {searchResults.length > 0 && (
                                    <div className={`mt-2 rounded-lg overflow-hidden border ${isLight ? 'border-slate-200 bg-white shadow-lg' : 'border-[#333] bg-[#1C1C1C]'}`}>
                                        {searchResults.map(u => (
                                            <div key={u._id} onClick={() => handleStartConversation(u)} className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all ${isLight ? 'hover:bg-indigo-50/50' : 'hover:bg-[#222]'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${getInitialColor(u.username)}`}>
                                                    {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-xs font-semibold">{u.username?.[0]?.toUpperCase()}</span>}
                                                </div>
                                                <span className={`text-xs font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{u.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Conversation / Blocked List */}
                    <div className="flex-1 overflow-y-auto">
                        {sidebarTab === 'chats' ? (
                            <>
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full"><div className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${isLight ? 'border-indigo-500' : 'border-indigo-400'}`} /></div>
                                ) : conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full px-6">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-indigo-50' : 'bg-indigo-900/20'}`}>
                                            <FontAwesomeIcon icon={faComments} className={`text-xl ${isLight ? 'text-indigo-300' : 'text-indigo-700'}`} />
                                        </div>
                                        <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>No conversations yet</p>
                                        <p className={`text-xs text-center ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Search for a user above to start chatting</p>
                                    </div>
                                ) : conversations.map(conv => {
                                    const other = getOtherParticipant(conv)
                                    const isActive = activeConversation?._id === conv._id
                                    const isTypingHere = typing[conv._id]
                                    const lastMsg = conv.lastMessage
                                    const preview = lastMsg?.fileUrl && !lastMsg?.content ? (isImageType(lastMsg.fileType) ? '📷 Photo' : '📎 File') : lastMsg?.content

                                    return (
                                        <div key={conv._id} onClick={() => handleSelectConversation(conv)}
                                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all relative ${isActive ? (isLight ? 'bg-indigo-50/50' : 'bg-indigo-900/10') : (isLight ? 'hover:bg-slate-50/60' : 'hover:bg-white/[0.02]')}`}>
                                            {isActive && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full ${isLight ? 'bg-indigo-500' : 'bg-indigo-400'}`} />}
                                            <div className="relative flex-shrink-0">
                                                <div className={`w-11 h-11 rounded-full flex items-center justify-center overflow-hidden ${getInitialColor(other.username)}`}>
                                                    {other.avatar ? <img src={other.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-sm font-bold">{other.username?.[0]?.toUpperCase()}</span>}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <span className={`font-semibold text-[13px] truncate ${isActive ? (isLight ? 'text-indigo-600' : 'text-indigo-400') : (isLight ? 'text-slate-800' : 'text-gray-100')}`}>{other.username}</span>
                                                    <span className={`text-[10px] flex-shrink-0 ml-2 tabular-nums ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{formatTime(lastMsg?.createdAt || conv.updatedAt)}</span>
                                                </div>
                                                <p className={`text-[11px] truncate leading-tight ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                    {isTypingHere ? <span className="text-indigo-400 italic font-medium">typing...</span> : (preview || 'Start a conversation')}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        ) : (
                            blockedUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full px-6">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isLight ? 'bg-slate-100' : 'bg-[#222]'}`}>
                                        <FontAwesomeIcon icon={faBan} className={`text-xl ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                                    </div>
                                    <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>No blocked users</p>
                                    <p className={`text-xs text-center ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>Users you block will appear here</p>
                                </div>
                            ) : blockedUsers.map(u => (
                                <div key={u._id} className={`flex items-center gap-3 px-4 py-3 border-b ${panelBorder}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${getInitialColor(u.username)}`}>
                                        {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-xs font-semibold">{u.username?.[0]?.toUpperCase()}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-xs truncate ${isLight ? 'text-slate-700' : 'text-gray-100'}`}>{u.username}</p>
                                        <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Blocked {formatTime(u.blockedAt)}</p>
                                    </div>
                                    <button onClick={() => handleUnblock(u._id)} className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#222] text-gray-400 hover:bg-[#2B2B2B] border border-[#333]'}`}>Unblock</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ─── Chat Area ─── */}
                <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-col flex-1 ${isLight ? 'bg-gradient-to-b from-slate-50/30 to-white/30' : 'bg-[#111]'}`}>
                    {activeConversation ? (() => {
                        const otherUser = getOtherParticipant(activeConversation)
                        return (
                            <>
                                {/* Chat Header */}
                                <div className={`flex items-center gap-3 px-4 sm:px-5 py-3 border-b ${panelBorder} ${isLight ? 'bg-white/90 backdrop-blur-sm' : 'bg-[#161616]'}`}>
                                    <button onClick={() => { setShowMobileChat(false); dispatch(setActiveConversation(null)) }} className={`md:hidden w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#222] text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                                    </button>
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${getInitialColor(otherUser.username)}`}>
                                        {otherUser.avatar ? <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-sm font-semibold">{otherUser.username?.[0]?.toUpperCase()}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>{otherUser.username}</p>
                                        {typing[activeConversation._id] && <p className="text-[11px] text-indigo-400 animate-pulse">typing...</p>}
                                    </div>
                                    <div className="relative" ref={headerMenuRef}>
                                        <button onClick={() => setShowHeaderMenu(!showHeaderMenu)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-600' : 'text-gray-500 hover:bg-[#222] hover:text-gray-300'}`}>
                                            <FontAwesomeIcon icon={faEllipsisV} className="text-sm" />
                                        </button>
                                        {showHeaderMenu && (
                                            <div className={`absolute right-0 top-full mt-1 w-40 rounded-lg overflow-hidden z-50 border shadow-lg ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                                {blockStatus?.iBlocked ? (
                                                    <button onClick={() => { dispatch(unblockUser(otherUser._id)); setShowHeaderMenu(false) }} className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 font-medium transition-all ${isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-[#222] text-gray-300'}`}>
                                                        <FontAwesomeIcon icon={faUnlock} className="text-[10px] text-emerald-500" /> Unblock
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleBlockUserAction(otherUser)} className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 font-medium transition-all ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-900/10 text-red-400'}`}>
                                                        <FontAwesomeIcon icon={faBan} className="text-[10px]" /> Block user
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteForMe(activeConversation._id)} className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 font-medium transition-all ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-900/10 text-red-400'}`}>
                                                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete chat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col">
                                    {messagesLoading ? (
                                        <div className="flex items-center justify-center h-full"><div className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${isLight ? 'border-indigo-500' : 'border-indigo-400'}`} /></div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${getInitialColor(otherUser.username)}`}>
                                                {otherUser.avatar ? <img src={otherUser.avatar} alt="" className="w-full h-full object-cover rounded-full" /> : <span className="text-white text-xl font-bold">{otherUser.username?.[0]?.toUpperCase()}</span>}
                                            </div>
                                            <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>Chat with {otherUser.username}</p>
                                            <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Send a message to start the conversation</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 mt-auto">
                                            {messages.map((msg, idx) => {
                                                const isMine = msg.sender?._id?.toString() === userId
                                                return (
                                                    <React.Fragment key={msg._id}>
                                                        {shouldShowDateSeparator(msg, idx) && (
                                                            <div className="flex items-center gap-3 my-4">
                                                                <div className={`flex-1 h-px ${isLight ? 'bg-slate-200' : 'bg-[#222]'}`} />
                                                                <span className={`text-[10px] font-medium px-3 py-1 rounded-full ${isLight ? 'text-slate-400 bg-slate-100' : 'text-gray-500 bg-[#1C1C1C]'}`}>{formatDateSeparator(msg.createdAt)}</span>
                                                                <div className={`flex-1 h-px ${isLight ? 'bg-slate-200' : 'bg-[#222]'}`} />
                                                            </div>
                                                        )}
                                                        <div className={`group/msg flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                            {!isMine && (
                                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 mb-5 ${getInitialColor(otherUser.username)}`}>
                                                                    {otherUser.avatar ? <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-[10px] font-semibold">{otherUser.username?.[0]?.toUpperCase()}</span>}
                                                                </div>
                                                            )}
                                                            {isMine && (
                                                                <div className="relative flex-shrink-0 self-center" ref={msgMenuId === msg._id ? msgMenuRef : null}>
                                                                    <button onClick={() => setMsgMenuId(msgMenuId === msg._id ? null : msg._id)} className={`w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-all ${isLight ? 'hover:bg-slate-200 text-slate-400 hover:text-slate-600' : 'hover:bg-[#333] text-gray-500 hover:text-gray-300'} ${msgMenuId === msg._id ? '!opacity-100' : ''}`}>
                                                                        <FontAwesomeIcon icon={faEllipsisV} className="text-[10px]" />
                                                                    </button>
                                                                    {msgMenuId === msg._id && (
                                                                        <div className={`absolute right-0 top-full mt-1 w-44 rounded-lg overflow-hidden shadow-lg z-50 border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                                                            <button onClick={() => handleDeleteMessage(msg._id)} className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2 font-medium transition-all ${isLight ? 'hover:bg-slate-50 text-slate-600' : 'hover:bg-[#222] text-gray-300'}`}>
                                                                                <FontAwesomeIcon icon={faTrash} className="text-[10px] text-gray-400" /> Delete for me
                                                                            </button>
                                                                            <button onClick={() => handleDeleteMessageEveryone(msg._id)} className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2 font-medium transition-all ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-900/10 text-red-400'}`}>
                                                                                <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete for everyone
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className={`max-w-[70%] sm:max-w-[60%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                                {msg.fileUrl && isImageType(msg.fileType) ? (
                                                                    <div className={`rounded-2xl overflow-hidden ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                                                                        <FileAttachment msg={msg} isMine={isMine} theme={theme} onImageClick={(url, name) => setLightboxImage({ url, name })} />
                                                                        {msg.content && (
                                                                            <div className={`px-3.5 py-2 ${isMine ? 'bg-indigo-600 text-white' : isLight ? 'bg-white text-slate-800 shadow-sm border-x border-b border-slate-100' : 'bg-[#1C1C1C] text-gray-100'}`}>
                                                                                <EmojiText text={msg.content} className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className={`px-3.5 py-2 rounded-2xl ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : isLight ? 'bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100' : 'bg-[#1C1C1C] text-gray-100 rounded-bl-sm border border-[#2B2B2B]'}`}>
                                                                        <FileAttachment msg={msg} isMine={isMine} theme={theme} onImageClick={(url, name) => setLightboxImage({ url, name })} />
                                                                        {msg.content && <EmojiText text={msg.content} className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" />}
                                                                    </div>
                                                                )}
                                                                <span className={`text-[10px] mt-1 px-1 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{formatMessageTime(msg.createdAt)}</span>
                                                            </div>
                                                            {!isMine && (
                                                                <div className="relative flex-shrink-0 self-center" ref={msgMenuId === msg._id ? msgMenuRef : null}>
                                                                    <button onClick={() => setMsgMenuId(msgMenuId === msg._id ? null : msg._id)} className={`w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-all ${isLight ? 'hover:bg-slate-200 text-slate-400' : 'hover:bg-[#333] text-gray-500'} ${msgMenuId === msg._id ? '!opacity-100' : ''}`}>
                                                                        <FontAwesomeIcon icon={faEllipsisV} className="text-[10px]" />
                                                                    </button>
                                                                    {msgMenuId === msg._id && (
                                                                        <div className={`absolute left-0 top-full mt-1 w-36 rounded-lg overflow-hidden shadow-lg z-50 border ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                                                            <button onClick={() => handleDeleteMessage(msg._id)} className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2 font-medium transition-all ${isLight ? 'hover:bg-red-50 text-red-500' : 'hover:bg-red-900/10 text-red-400'}`}>
                                                                                <FontAwesomeIcon icon={faTrash} className="text-[10px]" /> Delete for me
                                                                            </button>
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
                                    <div className={`mx-4 sm:mx-5 mb-2 px-4 py-2.5 rounded-lg flex items-center gap-3 border ${isLight ? 'bg-red-50 border-red-200' : 'bg-red-900/10 border-red-500/20'}`}>
                                        <FontAwesomeIcon icon={faBan} className="text-red-400 text-xs" />
                                        <p className={`text-xs flex-1 ${isLight ? 'text-red-600' : 'text-red-300'}`}>{blockStatus.iBlocked ? 'You have blocked this user.' : 'This user has blocked you.'}</p>
                                        {blockStatus.iBlocked && (
                                            <button onClick={() => dispatch(unblockUser(getOtherParticipant(activeConversation)._id))} className="px-2.5 py-1 text-[10px] font-medium rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">Unblock</button>
                                        )}
                                    </div>
                                )}

                                {/* File Preview */}
                                {filePreview && !blockStatus?.anyBlocked && (
                                    <div className={`mx-4 sm:mx-5 mb-2 p-3 rounded-lg flex items-center gap-3 border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#1C1C1C] border-[#333]'}`}>
                                        {isImageType(filePreview.type) ? (
                                            <img src={filePreview.dataUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isLight ? 'bg-indigo-50' : 'bg-indigo-900/20'}`}>
                                                <FontAwesomeIcon icon={faFile} className={`text-base ${isLight ? 'text-indigo-400' : 'text-indigo-400'}`} />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{filePreview.name}</p>
                                            <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{(filePreview.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button onClick={() => setFilePreview(null)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isLight ? 'text-slate-400 hover:bg-slate-200' : 'text-gray-500 hover:bg-[#333]'}`}>
                                            <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                        </button>
                                    </div>
                                )}

                                {/* Input Bar */}
                                <div className={`px-3 sm:px-4 py-3 border-t ${panelBorder} ${isLight ? 'bg-white/90 backdrop-blur-sm' : 'bg-[#161616]'}`}>
                                    {blockStatus?.anyBlocked ? (
                                        <div className={`text-center py-1 text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>You can't send messages in this conversation</div>
                                    ) : (
                                        <form onSubmit={handleSend} className="flex items-end gap-1.5 sm:gap-2">
                                            <div className="flex items-center gap-0.5">
                                                <div className="relative" ref={emojiRef}>
                                                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${showEmojiPicker ? (isLight ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white') : (isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-400')}`}>
                                                        <FontAwesomeIcon icon={faSmile} className="text-sm" />
                                                    </button>
                                                    {showEmojiPicker && (
                                                        <div className="absolute bottom-12 left-0 z-50">
                                                            <EmojiPicker onEmojiClick={d => setMessageInput(p => p + d.emoji)} theme={isDark ? 'dark' : 'light'} emojiStyle={EmojiStyle.APPLE} width={320} height={400} searchPlaceHolder="Search emoji..." previewConfig={{ showPreview: false }} />
                                                        </div>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-400'}`}>
                                                    <FontAwesomeIcon icon={faPaperclip} className="text-sm" />
                                                </button>
                                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar" onChange={handleFileSelect} />
                                            </div>
                                            <div className="flex-1">
                                                <input type="text" placeholder="Type a message..." value={messageInput} onChange={handleTyping}
                                                    className={`w-full px-4 py-2.5 text-sm rounded-lg border outline-none transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100' : 'bg-[#1A1A1A] border-[#333] text-gray-200 placeholder:text-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900/30'}`} />
                                            </div>
                                            <button type="submit" disabled={sending || (!messageInput.trim() && !filePreview)}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed ${isLight ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                                                {sending ? <FontAwesomeIcon icon={faSpinner} className="text-sm animate-spin" /> : <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </>
                        )
                    })() : (
                        <div className="flex flex-col items-center justify-center h-full px-8">
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-5 ${isLight ? 'bg-indigo-50' : 'bg-indigo-900/20'}`}>
                                <FontAwesomeIcon icon={faComments} className={`text-2xl ${isLight ? 'text-indigo-300' : 'text-indigo-600'}`} />
                            </div>
                            <p className={`text-base font-semibold mb-2 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>Your Messages</p>
                            <p className={`text-xs text-center max-w-[260px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Select a conversation from the sidebar or search for a user to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Messages
