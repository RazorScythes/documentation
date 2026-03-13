import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    getConversations, getOrCreateConversation, getMessages, sendMessage,
    searchUsers, getUnreadCount, setActiveConversation, clearSearchResults,
    deleteConversationForMe, deleteMessageForMe, deleteMessageForAll,
    blockUser, unblockUser, checkBlocked, clearBlockStatus
} from '../../actions/chat'
import useChat from '../../hooks/useChat'
import { dark, light } from '../../style'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faComment, faPaperPlane, faSearch, faTimes, faArrowLeft, faComments,
    faSmile, faPaperclip, faFile, faDownload, faImage, faTrash, faEllipsisV,
    faBan, faUnlock, faSpinner
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
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
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

const getInitialColor = (name) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500']
    return colors[(name || '').charCodeAt(0) % colors.length]
}

const triggerDownload = (dataUrl, fileName) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const WidgetFileAttachment = ({ msg, isMine, theme, onImageClick }) => {
    if (!msg.fileUrl) return null
    const isDark = theme !== 'light'

    if (isImageType(msg.fileType)) {
        return (
            <div className="rounded-lg overflow-hidden">
                <img
                    src={msg.fileUrl}
                    alt={msg.fileName || 'Image'}
                    className="w-full h-auto max-h-[180px] object-contain cursor-pointer block"
                    onClick={() => onImageClick?.(msg.fileUrl, msg.fileName)}
                />
            </div>
        )
    }

    return (
        <div className={`flex items-center gap-2 mb-1 p-2 rounded-lg cursor-pointer ${isMine ? 'bg-blue-700/40' : (isDark ? 'bg-white/5' : 'bg-black/5')}`} onClick={() => triggerDownload(msg.fileUrl, msg.fileName)}>
            <FontAwesomeIcon icon={faFile} className={`text-xs ${isMine ? 'text-blue-200' : 'text-blue-500'}`} />
            <span className={`text-[11px] truncate flex-1 ${isMine ? 'text-white' : ''}`}>{msg.fileName}</span>
            <FontAwesomeIcon icon={faDownload} className={`text-[10px] ${isMine ? 'text-blue-200' : (isDark ? 'text-gray-500' : 'text-gray-400')}`} />
        </div>
    )
}

const WidgetImageLightbox = ({ imageUrl, fileName, onClose }) => {
    if (!imageUrl) return null
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
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

const ChatWidget = ({ theme }) => {
    const dispatch = useDispatch()
    const {
        conversations, activeConversation, messages, searchResults, typing, unreadCount, messagesLoading, isLoading,
        blockStatus, sending
    } = useSelector((state) => state.chat)

    const userData = JSON.parse(localStorage.getItem('profile'))
    const userId = userData?._id

    const { emitTyping, emitStopTyping } = useChat(userId)

    const [isOpen, setIsOpen] = useState(false)
    const [messageInput, setMessageInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [view, setView] = useState('list')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [filePreview, setFilePreview] = useState(null)
    const [lightboxImage, setLightboxImage] = useState(null)
    const [msgMenuId, setMsgMenuId] = useState(null)
    const [showHeaderMenu, setShowHeaderMenu] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)
    const [confirmBlockUser, setConfirmBlockUser] = useState(null)
    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)
    const fileInputRef = useRef(null)
    const emojiRef = useRef(null)
    const msgMenuRef = useRef(null)
    const headerMenuRef = useRef(null)

    useEffect(() => {
        if (userId) {
            dispatch(getConversations())
            dispatch(getUnreadCount())
        }
    }, [userId, dispatch])

    useEffect(() => {
        if (activeConversation?._id && view === 'chat') {
            dispatch(getMessages({ conversationId: activeConversation._id }))
            const other = activeConversation?.participants?.find(p => p._id?.toString() !== userId)
            if (other?._id) dispatch(checkBlocked(other._id))
        } else {
            dispatch(clearBlockStatus())
        }
    }, [activeConversation?._id, view, dispatch])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmojiPicker(false)
            if (msgMenuRef.current && !msgMenuRef.current.contains(e.target)) setMsgMenuId(null)
            if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) setShowHeaderMenu(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!userId) return null

    const isDark = theme !== 'light'
    const t = isDark ? dark : light

    const handleSearch = (value) => {
        setSearchQuery(value)
        if (value.trim().length >= 2) dispatch(searchUsers(value))
        else dispatch(clearSearchResults())
    }

    const getOtherParticipant = (conv) => conv?.participants?.find(p => p._id?.toString() !== userId) || {}

    const handleSelectConversation = (conv) => { dispatch(setActiveConversation(conv)); setView('chat') }

    const handleStartConversation = (targetUser) => {
        dispatch(getOrCreateConversation({ targetUserId: targetUser._id }))
        setSearchQuery('')
        dispatch(clearSearchResults())
        setView('chat')
    }

    const handleSend = (e) => {
        e.preventDefault()
        if ((!messageInput.trim() && !filePreview) || !activeConversation?._id) return

        const payload = { conversationId: activeConversation._id, content: messageInput.trim() }
        if (filePreview) {
            payload.fileUrl = filePreview.dataUrl
            payload.fileName = filePreview.name
            payload.fileType = filePreview.type
        }

        dispatch(sendMessage(payload))
        setMessageInput('')
        setFilePreview(null)
        setShowEmojiPicker(false)

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
        if (!file || file.size > 5 * 1024 * 1024) return
        const reader = new FileReader()
        reader.onload = () => setFilePreview({ dataUrl: reader.result, name: file.name, type: file.type, size: file.size })
        reader.readAsDataURL(file)
        e.target.value = ''
    }

    const handleBack = () => { setView('list'); dispatch(setActiveConversation(null)); setShowEmojiPicker(false); setFilePreview(null) }

    const handleDeleteMessage = (messageId) => {
        dispatch(deleteMessageForMe(messageId))
        setMsgMenuId(null)
    }

    const handleDeleteMessageEveryone = (messageId) => {
        dispatch(deleteMessageForAll(messageId))
        setMsgMenuId(null)
    }

    const handleDeleteForMe = (conversationId) => {
        setShowHeaderMenu(false)
        setConfirmDeleteId(conversationId)
    }

    const confirmDelete = () => {
        if (confirmDeleteId) {
            dispatch(deleteConversationForMe(confirmDeleteId))
        }
        setConfirmDeleteId(null)
    }

    const handleBlockUser = (targetUser) => {
        setShowHeaderMenu(false)
        setConfirmBlockUser(targetUser)
    }

    const confirmBlock = () => {
        if (confirmBlockUser) {
            dispatch(blockUser({ targetUserId: confirmBlockUser._id }))
        }
        setConfirmBlockUser(null)
    }

    return (
        <>
        <WidgetImageLightbox
            imageUrl={lightboxImage?.url}
            fileName={lightboxImage?.name}
            onClose={() => setLightboxImage(null)}
        />

        {confirmDeleteId && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)}>
                <div
                    className={`w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-[#1C1C1C] border border-[#2B2B2B]' : 'bg-white border border-gray-200'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 pt-6 pb-4 text-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                            <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
                        </div>
                        <h3 className={`text-base font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>Delete chat?</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            All messages will be removed from your view. The other person will still have their copy.
                        </p>
                    </div>
                    <div className={`flex border-t ${isDark ? 'border-[#2B2B2B]' : 'border-gray-200'}`}>
                        <button
                            onClick={() => setConfirmDeleteId(null)}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-[#222]' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Cancel
                        </button>
                        <div className={`w-px ${isDark ? 'bg-[#2B2B2B]' : 'bg-gray-200'}`} />
                        <button
                            onClick={confirmDelete}
                            className="flex-1 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}

        {confirmBlockUser && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmBlockUser(null)}>
                <div
                    className={`w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl ${isDark ? 'bg-[#1C1C1C] border border-[#2B2B2B]' : 'bg-white border border-gray-200'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-6 pt-6 pb-4 text-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                            <FontAwesomeIcon icon={faBan} className="text-red-500 text-xl" />
                        </div>
                        <h3 className={`text-base font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>Block {confirmBlockUser.username}?</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            They won't be able to send you messages. You can unblock them later.
                        </p>
                    </div>
                    <div className={`flex border-t ${isDark ? 'border-[#2B2B2B]' : 'border-gray-200'}`}>
                        <button
                            onClick={() => setConfirmBlockUser(null)}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${isDark ? 'text-gray-300 hover:bg-[#222]' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Cancel
                        </button>
                        <div className={`w-px ${isDark ? 'bg-[#2B2B2B]' : 'bg-gray-200'}`} />
                        <button
                            onClick={confirmBlock}
                            className="flex-1 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                            Block
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div
                    className={`mb-3 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-[#1C1C1C] border border-[#2B2B2B]' : 'bg-white border border-blue-200/60 shadow-blue-200/20'}`}
                    style={{ width: 360, height: 480 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
                        <div className="flex items-center gap-2.5">
                            {view === 'chat' && (
                                <button onClick={handleBack} className="hover:opacity-80 transition-all">
                                    <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
                                </button>
                            )}
                            {view === 'chat' ? (() => {
                                const o = getOtherParticipant(activeConversation)
                                return (
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center overflow-hidden ${getInitialColor(o.username)}`}>
                                            {o.avatar ? <img src={o.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-[10px] font-semibold">{o.username?.[0]?.toUpperCase()}</span>}
                                        </div>
                                        <span className="font-medium text-sm">{o.username}</span>
                                    </div>
                                )
                            })() : (
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faComments} />
                                    <span className="font-semibold text-sm">Messages</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {view === 'chat' && activeConversation && (
                                <div className="relative" ref={headerMenuRef}>
                                    <button
                                        onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                                        className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faEllipsisV} className="text-sm" />
                                    </button>
                                    {showHeaderMenu && (() => {
                                        const o = getOtherParticipant(activeConversation)
                                        return (
                                            <div className={`absolute right-0 top-full mt-1 w-36 rounded-xl overflow-hidden shadow-xl z-50 border ${isDark ? 'bg-[#222] border-[#333]' : 'bg-white border-gray-200'}`}>
                                                {blockStatus?.iBlocked ? (
                                                    <button onClick={() => { dispatch(unblockUser(o._id)); setShowHeaderMenu(false) }} className={`w-full text-left px-3 py-2 text-[11px] flex items-center gap-2 transition-colors ${isDark ? 'hover:bg-[#2B2B2B] text-gray-300' : 'hover:bg-gray-50 text-gray-600'}`}>
                                                        <FontAwesomeIcon icon={faUnlock} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                                                        Unblock user
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleBlockUser(o)} className={`w-full text-left px-3 py-2 text-[11px] flex items-center gap-2 transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                                                        <FontAwesomeIcon icon={faBan} className="text-red-400" />
                                                        Block user
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteForMe(activeConversation._id)} className={`w-full text-left px-3 py-2 text-[11px] flex items-center gap-2 transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                                                    <FontAwesomeIcon icon={faTrash} className="text-red-400" />
                                                    Delete chat
                                                </button>
                                            </div>
                                        )
                                    })()}
                                </div>
                            )}
                            <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors">
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>
                    </div>

                    {view === 'list' ? (
                        <>
                            {/* Search */}
                            <div className={`p-2.5 ${isDark ? 'border-b border-[#2B2B2B]' : 'border-b border-blue-200/60'}`}>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl ${t.input}`} />
                                </div>
                                {searchResults.length > 0 && (
                                    <div className={`mt-1.5 rounded-xl overflow-hidden border ${isDark ? 'border-[#333] bg-[#222]' : 'border-gray-200 bg-white shadow-lg'}`}>
                                        {searchResults.map((u) => (
                                            <div key={u._id} onClick={() => handleStartConversation(u)} className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer text-xs transition-colors ${isDark ? 'hover:bg-[#2B2B2B]' : 'hover:bg-blue-50'}`}>
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center overflow-hidden ${getInitialColor(u.username)}`}>
                                                    {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-[10px] font-semibold">{u.username?.[0]?.toUpperCase()}</span>}
                                                </div>
                                                <span className={`truncate font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{u.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Conversations */}
                            <div className="flex-1 overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${isDark ? 'border-blue-400' : 'border-blue-500'}`} />
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full px-4">
                                        <FontAwesomeIcon icon={faComments} className={`text-2xl mb-2 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No conversations yet</p>
                                    </div>
                                ) : (
                                    conversations.map((conv) => {
                                        const other = getOtherParticipant(conv)
                                        const isTypingHere = typing[conv._id]
                                        const lastMsg = conv.lastMessage
                                        const preview = lastMsg?.fileUrl && !lastMsg?.content ? (isImageType(lastMsg.fileType) ? '📷 Photo' : '📎 File') : lastMsg?.content
                                        return (
                                            <div
                                                key={conv._id}
                                                onClick={() => handleSelectConversation(conv)}
                                                className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-all duration-200 ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50/60'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${getInitialColor(other.username)}`}>
                                                    {other.avatar
                                                        ? <img src={other.avatar} alt="" className="w-full h-full object-cover" />
                                                        : <span className="text-white text-xs font-bold">{other.username?.[0]?.toUpperCase()}</span>
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-0.5">
                                                        <span className={`font-semibold text-[13px] truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{other.username}</span>
                                                        <span className={`text-[10px] flex-shrink-0 ml-1 tabular-nums ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{formatTime(lastMsg?.createdAt || conv.updatedAt)}</span>
                                                    </div>
                                                    <p className={`text-[11px] truncate leading-tight ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {isTypingHere ? <span className="text-blue-400 italic font-medium">typing...</span> : (preview || 'Start a conversation')}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Messages */}
                            <div className={`flex-1 overflow-y-auto px-3 py-2.5 flex flex-col ${isDark ? 'bg-[#161616]' : 'bg-gray-50/50'}`}>
                                {messagesLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${isDark ? 'border-blue-400' : 'border-blue-500'}`} />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className={`flex items-center justify-center h-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <p className="text-xs">Send a message to start chatting</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1 mt-auto">
                                        {messages.map((msg) => {
                                            const isMine = msg.sender?._id?.toString() === userId
                                            return (
                                                <div key={msg._id} className={`group/msg flex items-center gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                    {isMine && (
                                                        <div className="relative flex-shrink-0" ref={msgMenuId === msg._id ? msgMenuRef : null}>
                                                            <button
                                                                onClick={() => setMsgMenuId(msgMenuId === msg._id ? null : msg._id)}
                                                                className={`w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-all ${
                                                                    isDark ? 'hover:bg-[#333] text-gray-500' : 'hover:bg-gray-200 text-gray-400'
                                                                } ${msgMenuId === msg._id ? '!opacity-100' : ''}`}
                                                            >
                                                                <FontAwesomeIcon icon={faEllipsisV} className="text-[8px]" />
                                                            </button>
                                                            {msgMenuId === msg._id && (
                                                                <div className={`absolute right-0 top-full mt-0.5 w-36 rounded-lg overflow-hidden shadow-xl z-50 border ${isDark ? 'bg-[#222] border-[#333]' : 'bg-white border-gray-200'}`}>
                                                                    <button onClick={() => handleDeleteMessage(msg._id)} className={`w-full text-left px-2.5 py-2 text-[11px] flex items-center gap-1.5 transition-colors ${isDark ? 'hover:bg-[#2B2B2B] text-gray-300' : 'hover:bg-gray-50 text-gray-600'}`}>
                                                                        <FontAwesomeIcon icon={faTrash} className="text-[9px] text-gray-400" />
                                                                        Delete for me
                                                                    </button>
                                                                    <button onClick={() => handleDeleteMessageEveryone(msg._id)} className={`w-full text-left px-2.5 py-2 text-[11px] flex items-center gap-1.5 transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                                                                        <FontAwesomeIcon icon={faTrash} className="text-[9px]" />
                                                                        Delete for everyone
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className={`max-w-[78%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                        {msg.fileUrl && isImageType(msg.fileType) ? (
                                                            <div className={`rounded-2xl overflow-hidden ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'}`}>
                                                                <WidgetFileAttachment msg={msg} isMine={isMine} theme={theme} onImageClick={(url, name) => setLightboxImage({ url, name })} />
                                                                {msg.content && (
                                                                    <div className={`px-3 py-1.5 ${
                                                                        isMine ? 'bg-blue-600 text-white' : isDark ? 'bg-[#2B2B2B] text-gray-100' : 'bg-white text-gray-800 shadow-sm border-x border-b border-gray-100'
                                                                    }`}>
                                                                        <EmojiText text={msg.content} className="text-xs whitespace-pre-wrap break-words leading-relaxed" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className={`px-3 py-1.5 rounded-2xl ${
                                                                isMine ? 'bg-blue-600 text-white rounded-br-sm' : isDark ? 'bg-[#2B2B2B] text-gray-100 rounded-bl-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                                                            }`}>
                                                                <WidgetFileAttachment msg={msg} isMine={isMine} theme={theme} onImageClick={(url, name) => setLightboxImage({ url, name })} />
                                                                {msg.content && <EmojiText text={msg.content} className="text-xs whitespace-pre-wrap break-words leading-relaxed" />}
                                                            </div>
                                                        )}
                                                        <span className={`text-[9px] mt-0.5 px-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{formatMessageTime(msg.createdAt)}</span>
                                                    </div>
                                                    {!isMine && (
                                                        <div className="relative flex-shrink-0" ref={msgMenuId === msg._id ? msgMenuRef : null}>
                                                            <button
                                                                onClick={() => setMsgMenuId(msgMenuId === msg._id ? null : msg._id)}
                                                                className={`w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-all ${
                                                                    isDark ? 'hover:bg-[#333] text-gray-500' : 'hover:bg-gray-200 text-gray-400'
                                                                } ${msgMenuId === msg._id ? '!opacity-100' : ''}`}
                                                            >
                                                                <FontAwesomeIcon icon={faEllipsisV} className="text-[8px]" />
                                                            </button>
                                                            {msgMenuId === msg._id && (
                                                                <div className={`absolute left-0 top-full mt-0.5 w-32 rounded-lg overflow-hidden shadow-xl z-50 border ${isDark ? 'bg-[#222] border-[#333]' : 'bg-white border-gray-200'}`}>
                                                                    <button onClick={() => handleDeleteMessage(msg._id)} className={`w-full text-left px-2.5 py-2 text-[11px] flex items-center gap-1.5 transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}>
                                                                        <FontAwesomeIcon icon={faTrash} className="text-[9px]" />
                                                                        Delete for me
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                                {typing[activeConversation?._id] && (
                                    <div className="flex justify-start mt-1">
                                        <div className={`px-3 py-1.5 rounded-2xl rounded-bl-sm text-xs italic ${isDark ? 'bg-[#2B2B2B] text-gray-400' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
                                            typing...
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Blocked Banner */}
                            {blockStatus?.anyBlocked && (
                                <div className={`mx-3 mb-1 px-3 py-2 rounded-lg flex items-center gap-2 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                                    <FontAwesomeIcon icon={faBan} className="text-red-400 text-[11px]" />
                                    <p className={`text-[11px] flex-1 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                                        {blockStatus.iBlocked ? 'You blocked this user' : 'This user blocked you'}
                                    </p>
                                    {blockStatus.iBlocked && (
                                        <button
                                            onClick={() => dispatch(unblockUser(getOtherParticipant(activeConversation)._id))}
                                            className="px-2 py-0.5 text-[10px] font-medium rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                        >
                                            Unblock
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* File Preview */}
                            {filePreview && !blockStatus?.anyBlocked && (
                                <div className={`mx-3 mb-1 p-2 rounded-lg flex items-center gap-2 ${isDark ? 'bg-[#222] border border-[#333]' : 'bg-gray-50 border border-gray-200'}`}>
                                    {isImageType(filePreview.type) ? (
                                        <img src={filePreview.dataUrl} alt="" className="w-10 h-10 rounded object-cover" />
                                    ) : (
                                        <FontAwesomeIcon icon={faFile} className={`text-sm ${isDark ? 'text-gray-400' : 'text-blue-400'}`} />
                                    )}
                                    <span className={`text-[11px] truncate flex-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{filePreview.name}</span>
                                    <button onClick={() => setFilePreview(null)} className={`text-xs ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            )}

                            {/* Input */}
                            <div className={`px-3 py-2 ${isDark ? 'border-t border-[#2B2B2B]' : 'border-t border-gray-100'}`}>
                                {blockStatus?.anyBlocked ? (
                                    <div className={`text-center py-1 text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        You can't send messages in this conversation
                                    </div>
                                ) : (
                                <form onSubmit={handleSend} className="flex items-end gap-1.5">
                                    <div className="relative" ref={emojiRef}>
                                        <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${showEmojiPicker ? 'bg-blue-600 text-white' : isDark ? 'hover:bg-[#2B2B2B] text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}>
                                            <FontAwesomeIcon icon={faSmile} />
                                        </button>
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-10 left-0 z-50">
                                                <EmojiPicker onEmojiClick={(d) => setMessageInput(p => p + d.emoji)} theme={isDark ? 'dark' : 'light'} emojiStyle={EmojiStyle.APPLE} width={300} height={350} searchPlaceHolder="Search..." previewConfig={{ showPreview: false }} />
                                            </div>
                                        )}
                                    </div>

                                    <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${isDark ? 'hover:bg-[#2B2B2B] text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faPaperclip} />
                                    </button>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar" onChange={handleFileSelect} />

                                    <input type="text" placeholder="Type a message..." value={messageInput} onChange={handleTyping} className={`flex-1 px-3 py-2 text-xs rounded-xl ${t.input}`} />

                                    <button type="submit" disabled={sending || (!messageInput.trim() && !filePreview)} className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
                                        {sending
                                            ? <FontAwesomeIcon icon={faSpinner} className="text-xs animate-spin" />
                                            : <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                                        }
                                    </button>
                                </form>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all relative group"
                >
                    <FontAwesomeIcon icon={faComment} className="text-xl transition-transform duration-200 group-hover:scale-110" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            )}
        </div>
        </>
    )
}

export default ChatWidget
