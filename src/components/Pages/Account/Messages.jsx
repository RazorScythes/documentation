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
    faTrash, faEllipsisV, faBan, faUnlock
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

const FileAttachment = ({ msg, isMine, theme, onImageClick }) => {
    if (!msg.fileUrl) return null

    if (isImageType(msg.fileType)) {
        return (
            <div className="rounded-lg overflow-hidden">
                <img
                    src={msg.fileUrl}
                    alt={msg.fileName || 'Image'}
                    className="max-w-[280px] w-full h-auto max-h-[300px] object-contain cursor-pointer block"
                    onClick={() => onImageClick?.(msg.fileUrl, msg.fileName)}
                />
            </div>
        )
    }

    return (
        <div
            className={`flex items-center gap-2.5 mb-1.5 p-2.5 rounded-lg cursor-pointer ${
                isMine ? 'bg-blue-700/40' : (theme === 'light' ? 'bg-black/5' : 'bg-white/5')
            }`}
            onClick={() => triggerDownload(msg.fileUrl, msg.fileName)}
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isMine ? 'bg-blue-500/30' : (theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20')
            }`}>
                <FontAwesomeIcon icon={faFile} className={`text-sm ${isMine ? 'text-blue-200' : 'text-blue-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isMine ? 'text-white' : ''}`}>{msg.fileName}</p>
                <p className={`text-[10px] ${isMine ? 'text-blue-200' : (theme === 'light' ? 'text-gray-400' : 'text-gray-500')}`}>
                    Click to download
                </p>
            </div>
            <FontAwesomeIcon icon={faDownload} className={`text-xs flex-shrink-0 ${isMine ? 'text-blue-200' : (theme === 'light' ? 'text-gray-400' : 'text-gray-500')}`} />
        </div>
    )
}

const ImageLightbox = ({ imageUrl, fileName, onClose, theme }) => {
    if (!imageUrl) return null
    const isDark = theme !== 'light'

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="absolute -top-12 right-0 flex items-center gap-2">
                    <button
                        onClick={() => triggerDownload(imageUrl, fileName)}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                        title="Download"
                    >
                        <FontAwesomeIcon icon={faDownload} className="text-sm" />
                    </button>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </button>
                </div>
                <img
                    src={imageUrl}
                    alt={fileName || 'Image'}
                    className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                />
            </div>
        </div>
    )
}

const Messages = ({ user, theme }) => {
    const dispatch = useDispatch()
    const {
        conversations, activeConversation, messages, searchResults, typing, messagesLoading, isLoading,
        blockedUsers, blockStatus, sending
    } = useSelector((state) => state.chat)

    const userData = JSON.parse(localStorage.getItem('profile'))
    const userId = userData?._id

    const { emitTyping, emitStopTyping } = useChat(userId)

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

    useEffect(() => {
        dispatch(getConversations())
        dispatch(getUnreadCount())
    }, [dispatch])

    useEffect(() => {
        if (activeConversation?._id) {
            dispatch(getMessages({ conversationId: activeConversation._id }))
            const other = activeConversation?.participants?.find(p => p._id?.toString() !== userId)
            if (other?._id) dispatch(checkBlocked(other._id))
        } else {
            dispatch(clearBlockStatus())
        }
    }, [activeConversation?._id, dispatch])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiRef.current && !emojiRef.current.contains(e.target)) {
                setShowEmojiPicker(false)
            }
            if (msgMenuRef.current && !msgMenuRef.current.contains(e.target)) {
                setMsgMenuId(null)
            }
            if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
                setShowHeaderMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSearch = useCallback((value) => {
        setSearchQuery(value)
        if (value.trim().length >= 2) {
            dispatch(searchUsers(value))
        } else {
            dispatch(clearSearchResults())
        }
    }, [dispatch])

    const handleSelectConversation = (conv) => {
        dispatch(setActiveConversation(conv))
        setShowMobileChat(true)
    }

    const handleStartConversation = (targetUser) => {
        dispatch(getOrCreateConversation({ targetUserId: targetUser._id }))
        setSearchQuery('')
        dispatch(clearSearchResults())
        setShowMobileChat(true)
    }

    const getOtherParticipant = (conv) => {
        return conv?.participants?.find(p => p._id?.toString() !== userId) || {}
    }

    const handleSend = (e) => {
        e.preventDefault()
        if ((!messageInput.trim() && !filePreview) || !activeConversation?._id) return

        const payload = {
            conversationId: activeConversation._id,
            content: messageInput.trim()
        }

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
        typingTimeoutRef.current = setTimeout(() => {
            emitStopTyping(activeConversation._id, other._id)
        }, 2000)
    }

    const handleEmojiClick = (emojiData) => {
        setMessageInput(prev => prev + emojiData.emoji)
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be under 5MB')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setFilePreview({
                dataUrl: reader.result,
                name: file.name,
                type: file.type,
                size: file.size
            })
        }
        reader.readAsDataURL(file)
        e.target.value = ''
    }

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
            dispatch(blockUser({ targetUserId: confirmBlockUser._id })).then(() => {
                dispatch(getBlockedUsers())
            })
        }
        setConfirmBlockUser(null)
    }

    const handleUnblock = (targetUserId) => {
        dispatch(unblockUser(targetUserId))
    }

    const handleSidebarTab = (tab) => {
        setSidebarTab(tab)
        if (tab === 'blocked') {
            dispatch(getBlockedUsers())
        }
    }

    const t = theme === 'light' ? light : dark
    const isDark = theme !== 'light'

    const shouldShowDateSeparator = (msg, idx) => {
        if (idx === 0) return true
        const prev = new Date(messages[idx - 1].createdAt).toDateString()
        const curr = new Date(msg.createdAt).toDateString()
        return prev !== curr
    }

    const getInitialColor = (name) => {
        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500']
        const idx = (name || '').charCodeAt(0) % colors.length
        return colors[idx]
    }

    return (
        <div>
            <ImageLightbox
                imageUrl={lightboxImage?.url}
                fileName={lightboxImage?.name}
                onClose={() => setLightboxImage(null)}
                theme={theme}
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
                                They won't be able to send you messages. You can unblock them later from the blocked tab.
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

            <div className={`flex rounded-xl overflow-hidden border ${isDark ? 'bg-[#1C1C1C] border-[#2B2B2B]' : 'bg-white/80 border-blue-200/60'}`} style={{ height: '68vh' }}>

                {/* ─── Sidebar ─── */}
                <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col md:w-[320px] w-full flex-shrink-0 ${isDark ? 'border-r border-[#2B2B2B]' : 'border-r border-blue-200/60'}`}>

                    {/* Sidebar Header */}
                    <div className={`px-4 py-3.5 ${isDark ? 'border-b border-[#2B2B2B]' : 'border-b border-blue-200/60'}`}>
                        <div className="flex gap-1 mb-3">
                            <button
                                onClick={() => handleSidebarTab('chats')}
                                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                                    sidebarTab === 'chats'
                                        ? 'bg-blue-600 text-white'
                                        : isDark ? 'text-gray-400 hover:bg-[#2B2B2B]' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                Chats
                            </button>
                            <button
                                onClick={() => handleSidebarTab('blocked')}
                                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                                    sidebarTab === 'blocked'
                                        ? 'bg-blue-600 text-white'
                                        : isDark ? 'text-gray-400 hover:bg-[#2B2B2B]' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                Blocked
                            </button>
                        </div>

                        {sidebarTab === 'chats' && (
                            <>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <input
                                        type="text"
                                        placeholder="Search users to chat..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl ${t.input}`}
                                    />
                                </div>

                                {searchResults.length > 0 && (
                                    <div className={`mt-2 rounded-xl overflow-hidden border ${isDark ? 'border-[#333] bg-[#222]' : 'border-gray-200 bg-white shadow-lg'}`}>
                                        {searchResults.map((u) => (
                                            <div
                                                key={u._id}
                                                onClick={() => handleStartConversation(u)}
                                                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${isDark ? 'hover:bg-[#2B2B2B]' : 'hover:bg-blue-50'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${getInitialColor(u.username)}`}>
                                                    {u.avatar ? (
                                                        <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-white text-xs font-semibold">{u.username?.[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{u.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Conversation List / Blocked List */}
                    <div className="flex-1 overflow-y-auto">
                        {sidebarTab === 'chats' ? (
                            <>
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${isDark ? 'border-blue-400' : 'border-blue-500'}`} />
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full px-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-[#2B2B2B]' : 'bg-blue-50'}`}>
                                            <FontAwesomeIcon icon={faComments} className={`text-2xl ${isDark ? 'text-gray-500' : 'text-blue-300'}`} />
                                        </div>
                                        <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No conversations yet</p>
                                        <p className={`text-xs text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Search for a user above to start chatting</p>
                                    </div>
                                ) : (
                                    conversations.map((conv) => {
                                        const other = getOtherParticipant(conv)
                                        const isActive = activeConversation?._id === conv._id
                                        const isTypingHere = typing[conv._id]
                                        const lastMsg = conv.lastMessage
                                        const preview = lastMsg?.fileUrl && !lastMsg?.content
                                            ? (isImageType(lastMsg.fileType) ? '📷 Photo' : '📎 File')
                                            : lastMsg?.content

                                        return (
                                            <div
                                                key={conv._id}
                                                onClick={() => handleSelectConversation(conv)}
                                                className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition-all duration-200 relative ${
                                                    isActive
                                                        ? (isDark ? 'bg-blue-500/8' : 'bg-blue-50/70')
                                                        : (isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50/60')
                                                }`}
                                            >
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-blue-500 rounded-r-full" />
                                                )}
                                                <div className="relative flex-shrink-0">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${getInitialColor(other.username)}`}>
                                                        {other.avatar ? (
                                                            <img src={other.avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-white text-sm font-bold">{other.username?.[0]?.toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <span className={`font-semibold text-sm truncate ${
                                                            isActive
                                                                ? (isDark ? 'text-blue-400' : 'text-blue-600')
                                                                : (isDark ? 'text-gray-100' : 'text-gray-800')
                                                        }`}>{other.username}</span>
                                                        <span className={`text-[10px] flex-shrink-0 ml-2 tabular-nums ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                            {formatTime(lastMsg?.createdAt || conv.updatedAt)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-[12px] truncate leading-tight ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {isTypingHere ? (
                                                            <span className="text-blue-400 italic font-medium">typing...</span>
                                                        ) : (
                                                            preview || 'Start a conversation'
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </>
                        ) : (
                            blockedUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full px-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-[#2B2B2B]' : 'bg-gray-100'}`}>
                                        <FontAwesomeIcon icon={faBan} className={`text-2xl ${isDark ? 'text-gray-500' : 'text-gray-300'}`} />
                                    </div>
                                    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No blocked users</p>
                                    <p className={`text-xs text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Users you block will appear here</p>
                                </div>
                            ) : (
                                blockedUsers.map((u) => (
                                    <div
                                        key={u._id}
                                        className={`flex items-center gap-3 px-4 py-3 ${isDark ? 'border-b border-[#2B2B2B]' : 'border-b border-gray-100'}`}
                                    >
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${getInitialColor(u.username)}`}>
                                            {u.avatar ? (
                                                <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white text-sm font-semibold">{u.username?.[0]?.toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-[13px] truncate ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{u.username}</p>
                                            <p className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                Blocked {formatTime(u.blockedAt)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleUnblock(u._id)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                                isDark ? 'bg-[#2B2B2B] text-gray-300 hover:bg-[#333] hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                                            }`}
                                        >
                                            Unblock
                                        </button>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>

                {/* ─── Chat Area ─── */}
                <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-col flex-1 ${isDark ? 'bg-[#161616]' : 'bg-gradient-to-b from-gray-50/50 to-white/50'}`}>
                    {activeConversation ? (() => {
                        const otherUser = getOtherParticipant(activeConversation)
                        return (
                            <>
                                {/* Chat Header */}
                                <div className={`flex items-center gap-3 px-5 py-3 ${isDark ? 'bg-[#1C1C1C] border-b border-[#2B2B2B]' : 'bg-white/90 border-b border-blue-200/60 backdrop-blur-sm'}`}>
                                    <button
                                        onClick={() => { setShowMobileChat(false); dispatch(setActiveConversation(null)) }}
                                        className={`md:hidden p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#2B2B2B] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} />
                                    </button>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${getInitialColor(otherUser.username)}`}>
                                        {otherUser.avatar ? (
                                            <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white text-sm font-semibold">{otherUser.username?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{otherUser.username}</p>
                                        {typing[activeConversation._id] && (
                                            <p className="text-xs text-blue-400 animate-pulse">typing...</p>
                                        )}
                                    </div>
                                    <div className="relative" ref={headerMenuRef}>
                                        <button
                                            onClick={() => setShowHeaderMenu(!showHeaderMenu)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                isDark ? 'hover:bg-[#2B2B2B] text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faEllipsisV} className="text-sm" />
                                        </button>
                                        {showHeaderMenu && (
                                            <div className={`absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden shadow-xl z-50 border ${
                                                isDark ? 'bg-[#222] border-[#333]' : 'bg-white border-gray-200'
                                            }`}>
                                                {blockStatus?.iBlocked ? (
                                                    <button
                                                        onClick={() => { dispatch(unblockUser(otherUser._id)); setShowHeaderMenu(false) }}
                                                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2.5 transition-colors ${
                                                            isDark ? 'hover:bg-[#2B2B2B] text-gray-300' : 'hover:bg-gray-50 text-gray-600'
                                                        }`}
                                                    >
                                                        <FontAwesomeIcon icon={faUnlock} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                                                        Unblock user
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBlockUser(otherUser)}
                                                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2.5 transition-colors ${
                                                            isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'
                                                        }`}
                                                    >
                                                        <FontAwesomeIcon icon={faBan} className="text-red-400" />
                                                        Block user
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteForMe(activeConversation._id)}
                                                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center gap-2.5 transition-colors ${
                                                        isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="text-red-400" />
                                                    Delete chat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto px-5 py-4">
                                    {messagesLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${isDark ? 'border-blue-400' : 'border-blue-500'}`} />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${getInitialColor(otherUser.username)}`}>
                                                {otherUser.avatar ? (
                                                    <img src={otherUser.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    <span className="text-white text-2xl font-bold">{otherUser.username?.[0]?.toUpperCase()}</span>
                                                )}
                                            </div>
                                            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Chat with {otherUser.username}</p>
                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Send a message to start the conversation</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {messages.map((msg, idx) => {
                                                const isMine = msg.sender?._id?.toString() === userId

                                                return (
                                                    <React.Fragment key={msg._id}>
                                                        {shouldShowDateSeparator(msg, idx) && (
                                                            <div className="flex items-center gap-3 my-4">
                                                                <div className={`flex-1 h-px ${isDark ? 'bg-[#2B2B2B]' : 'bg-gray-200'}`} />
                                                                <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${isDark ? 'text-gray-500 bg-[#222]' : 'text-gray-400 bg-gray-100'}`}>
                                                                    {formatDateSeparator(msg.createdAt)}
                                                                </span>
                                                                <div className={`flex-1 h-px ${isDark ? 'bg-[#2B2B2B]' : 'bg-gray-200'}`} />
                                                            </div>
                                                        )}

                                                        <div className={`group/msg flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                            {!isMine && (
                                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 mb-5 ${getInitialColor(otherUser.username)}`}>
                                                                    {otherUser.avatar ? (
                                                                        <img src={otherUser.avatar} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-white text-[10px] font-semibold">{otherUser.username?.[0]?.toUpperCase()}</span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {isMine && (
                                                                <div className="relative flex-shrink-0 self-center" ref={msgMenuId === msg._id ? msgMenuRef : null}>
                                                                    <button
                                                                        onClick={() => setMsgMenuId(msgMenuId === msg._id ? null : msg._id)}
                                                                        className={`w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-all ${
                                                                            isDark ? 'hover:bg-[#333] text-gray-500 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
                                                                        } ${msgMenuId === msg._id ? '!opacity-100' : ''}`}
                                                                    >
                                                                        <FontAwesomeIcon icon={faEllipsisV} className="text-[10px]" />
                                                                    </button>
                                                                    {msgMenuId === msg._id && (
                                                                        <div className={`absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden shadow-xl z-50 border ${isDark ? 'bg-[#222] border-[#333]' : 'bg-white border-gray-200'}`}>
                                                                            <button
                                                                                onClick={() => handleDeleteMessage(msg._id)}
                                                                                className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-colors ${isDark ? 'hover:bg-[#2B2B2B] text-gray-300' : 'hover:bg-gray-50 text-gray-600'}`}
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} className="text-gray-400" />
                                                                                Delete for me
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteMessageEveryone(msg._id)}
                                                                                className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} />
                                                                                Delete for everyone
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className={`max-w-[65%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                                                                {msg.fileUrl && isImageType(msg.fileType) ? (
                                                                    <div className={`rounded-2xl overflow-hidden ${
                                                                        isMine ? 'rounded-br-sm' : 'rounded-bl-sm'
                                                                    }`}>
                                                                        <FileAttachment msg={msg} isMine={isMine} theme={theme} onImageClick={(url, name) => setLightboxImage({ url, name })} />
                                                                        {msg.content && (
                                                                            <div className={`px-3.5 py-2 ${
                                                                                isMine
                                                                                    ? 'bg-blue-600 text-white'
                                                                                    : isDark
                                                                                        ? 'bg-[#2B2B2B] text-gray-100'
                                                                                        : 'bg-white text-gray-800 shadow-sm border-x border-b border-gray-100'
                                                                            }`}>
                                                                                <EmojiText text={msg.content} className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className={`px-3.5 py-2 rounded-2xl ${
                                                                        isMine
                                                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                                                            : isDark
                                                                                ? 'bg-[#2B2B2B] text-gray-100 rounded-bl-sm'
                                                                                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                                                                    }`}>
                                                                        <FileAttachment msg={msg} isMine={isMine} theme={theme} onImageClick={(url, name) => setLightboxImage({ url, name })} />
                                                                        {msg.content && (
                                                                            <EmojiText text={msg.content} className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" />
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <span className={`text-[10px] mt-1 px-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                                                    {formatMessageTime(msg.createdAt)}
                                                                </span>
                                                            </div>

                                                            {!isMine && (
                                                                <div className="relative flex-shrink-0 self-center" ref={msgMenuId === msg._id ? msgMenuRef : null}>
                                                                    <button
                                                                        onClick={() => setMsgMenuId(msgMenuId === msg._id ? null : msg._id)}
                                                                        className={`w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover/msg:opacity-100 transition-all ${
                                                                            isDark ? 'hover:bg-[#333] text-gray-500 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
                                                                        } ${msgMenuId === msg._id ? '!opacity-100' : ''}`}
                                                                    >
                                                                        <FontAwesomeIcon icon={faEllipsisV} className="text-[10px]" />
                                                                    </button>
                                                                    {msgMenuId === msg._id && (
                                                                        <div className={`absolute left-0 top-full mt-1 w-36 rounded-xl overflow-hidden shadow-xl z-50 border ${isDark ? 'bg-[#222] border-[#333]' : 'bg-white border-gray-200'}`}>
                                                                            <button
                                                                                onClick={() => handleDeleteMessage(msg._id)}
                                                                                className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2 transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                                                                            >
                                                                                <FontAwesomeIcon icon={faTrash} />
                                                                                Delete for me
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
                                    <div className={`mx-5 mb-2 px-4 py-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                                        <FontAwesomeIcon icon={faBan} className="text-red-400 text-sm" />
                                        <p className={`text-xs flex-1 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                                            {blockStatus.iBlocked
                                                ? 'You have blocked this user.'
                                                : 'This user has blocked you.'}
                                        </p>
                                        {blockStatus.iBlocked && (
                                            <button
                                                onClick={() => dispatch(unblockUser(getOtherParticipant(activeConversation)._id))}
                                                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                            >
                                                Unblock
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* File Preview */}
                                {filePreview && !blockStatus?.anyBlocked && (
                                    <div className={`mx-5 mb-2 p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-[#222] border border-[#333]' : 'bg-gray-50 border border-gray-200'}`}>
                                        {isImageType(filePreview.type) ? (
                                            <img src={filePreview.dataUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
                                        ) : (
                                            <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#2B2B2B]' : 'bg-blue-50'}`}>
                                                <FontAwesomeIcon icon={faFile} className={`text-lg ${isDark ? 'text-gray-400' : 'text-blue-400'}`} />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{filePreview.name}</p>
                                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {(filePreview.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <button onClick={() => setFilePreview(null)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-[#333] text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                )}

                                {/* Input Bar */}
                                <div className={`px-4 py-3 ${isDark ? 'bg-[#1C1C1C] border-t border-[#2B2B2B]' : 'bg-white/90 border-t border-blue-200/60 backdrop-blur-sm'}`}>
                                    {blockStatus?.anyBlocked ? (
                                        <div className={`text-center py-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            You can't send messages in this conversation
                                        </div>
                                    ) : (
                                    <form onSubmit={handleSend} className="flex items-end gap-2">
                                        <div className="flex items-center gap-1">
                                            <div className="relative" ref={emojiRef}>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                                        showEmojiPicker
                                                            ? 'bg-blue-600 text-white'
                                                            : isDark ? 'hover:bg-[#2B2B2B] text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                                    }`}
                                                >
                                                    <FontAwesomeIcon icon={faSmile} />
                                                </button>
                                                {showEmojiPicker && (
                                                    <div className="absolute bottom-12 left-0 z-50">
                                                        <EmojiPicker
                                                            onEmojiClick={handleEmojiClick}
                                                            theme={isDark ? 'dark' : 'light'}
                                                            emojiStyle={EmojiStyle.APPLE}
                                                            width={320}
                                                            height={400}
                                                            searchPlaceHolder="Search emoji..."
                                                            previewConfig={{ showPreview: false }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                                                    isDark ? 'hover:bg-[#2B2B2B] text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                                }`}
                                            >
                                                <FontAwesomeIcon icon={faPaperclip} />
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                                                onChange={handleFileSelect}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                value={messageInput}
                                                onChange={handleTyping}
                                                className={`w-full px-4 py-2.5 text-sm rounded-xl ${t.input}`}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={sending || (!messageInput.trim() && !filePreview)}
                                            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                                        >
                                            {sending
                                                ? <FontAwesomeIcon icon={faSpinner} className="text-sm animate-spin" />
                                                : <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                                            }
                                        </button>
                                    </form>
                                    )}
                                </div>
                            </>
                        )
                    })() : (
                        <div className="flex flex-col items-center justify-center h-full px-8">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${isDark ? 'bg-[#222]' : 'bg-blue-50'}`}>
                                <FontAwesomeIcon icon={faComments} className={`text-3xl ${isDark ? 'text-gray-600' : 'text-blue-300'}`} />
                            </div>
                            <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Your Messages</p>
                            <p className={`text-sm text-center max-w-[260px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                Select a conversation from the sidebar or search for a user to start chatting
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Messages
