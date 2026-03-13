import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { io as socketIO } from 'socket.io-client'
import { addMessage, setTyping, getUnreadCount, removeConversation, removeMessage } from '../actions/chat'

const socketUrl = import.meta.env.VITE_DEVELOPMENT == "true"
    ? `${import.meta.env.VITE_APP_PROTOCOL}://${import.meta.env.VITE_APP_LOCALHOST}:${import.meta.env.VITE_APP_SERVER_PORT}`
    : import.meta.env.VITE_APP_BASE_URL

const useChat = (userId) => {
    const dispatch = useDispatch()
    const socketRef = useRef(null)

    useEffect(() => {
        if (!userId) return

        const socket = socketIO(socketUrl, { transports: ['websocket', 'polling'] })
        socketRef.current = socket

        socket.emit('join_chat', userId)

        socket.on('new_message', (data) => {
            dispatch(addMessage(data))
            dispatch(getUnreadCount())
        })

        socket.on('typing', ({ conversationId, username }) => {
            dispatch(setTyping({ conversationId, username }))
        })

        socket.on('stop_typing', ({ conversationId }) => {
            dispatch(setTyping({ conversationId, username: null }))
        })

        socket.on('conversation_deleted', ({ conversationId }) => {
            dispatch(removeConversation(conversationId))
        })

        socket.on('message_deleted', ({ messageId }) => {
            dispatch(removeMessage(messageId))
        })

        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [userId, dispatch])

    const emitTyping = (conversationId, recipientId, username) => {
        socketRef.current?.emit('typing', { conversationId, recipientId, username })
    }

    const emitStopTyping = (conversationId, recipientId) => {
        socketRef.current?.emit('stop_typing', { conversationId, recipientId })
    }

    return { emitTyping, emitStopTyping }
}

export default useChat
