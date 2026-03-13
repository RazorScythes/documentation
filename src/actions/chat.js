import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    conversations: [],
    activeConversation: null,
    messages: [],
    unreadCount: 0,
    searchResults: [],
    blockedUsers: [],
    blockStatus: null,
    typing: {},
    alert: {},
    isLoading: false,
    messagesLoading: false,
    sending: false
}

export const getConversations = createAsyncThunk('chat/getConversations', async (_, thunkAPI) => {
    try {
        const response = await api.getConversations()
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const getOrCreateConversation = createAsyncThunk('chat/getOrCreateConversation', async (formData, thunkAPI) => {
    try {
        const response = await api.getOrCreateConversation(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const getMessages = createAsyncThunk('chat/getMessages', async ({ conversationId, params }, thunkAPI) => {
    try {
        const response = await api.getMessages(conversationId, params)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const sendMessage = createAsyncThunk('chat/sendMessage', async (formData, thunkAPI) => {
    try {
        const response = await api.sendMessage(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const searchUsers = createAsyncThunk('chat/searchUsers', async (q, thunkAPI) => {
    try {
        const response = await api.chatSearchUsers(q)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const getUnreadCount = createAsyncThunk('chat/getUnreadCount', async (_, thunkAPI) => {
    try {
        const response = await api.getUnreadCount()
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const deleteMessageForMe = createAsyncThunk('chat/deleteMessageForMe', async (messageId, thunkAPI) => {
    try {
        const response = await api.deleteMessageForMe(messageId)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const deleteMessageForAll = createAsyncThunk('chat/deleteMessageForAll', async (messageId, thunkAPI) => {
    try {
        const response = await api.deleteMessageForAll(messageId)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const deleteConversationForMe = createAsyncThunk('chat/deleteConversationForMe', async (conversationId, thunkAPI) => {
    try {
        const response = await api.deleteConversationForMe(conversationId)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const deleteConversationForAll = createAsyncThunk('chat/deleteConversationForAll', async (conversationId, thunkAPI) => {
    try {
        const response = await api.deleteConversationForAll(conversationId)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const blockUser = createAsyncThunk('chat/blockUser', async (formData, thunkAPI) => {
    try {
        const response = await api.blockUser(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const unblockUser = createAsyncThunk('chat/unblockUser', async (targetUserId, thunkAPI) => {
    try {
        const response = await api.unblockUser(targetUserId)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const getBlockedUsers = createAsyncThunk('chat/getBlockedUsers', async (_, thunkAPI) => {
    try {
        const response = await api.getBlockedUsers()
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const checkBlocked = createAsyncThunk('chat/checkBlocked', async (targetUserId, thunkAPI) => {
    try {
        const response = await api.checkBlocked(targetUserId)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getConversations.pending, (state) => {
            state.isLoading = true
        }),
        builder.addCase(getConversations.fulfilled, (state, action) => {
            state.conversations = action.payload.data.result
            state.isLoading = false
        }),
        builder.addCase(getConversations.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
            state.isLoading = false
        }),

        builder.addCase(getOrCreateConversation.fulfilled, (state, action) => {
            state.activeConversation = action.payload.data.result
            const exists = state.conversations.find(c => c._id === action.payload.data.result._id)
            if (!exists) {
                state.conversations.unshift(action.payload.data.result)
            }
            state.isLoading = false
        }),
        builder.addCase(getOrCreateConversation.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
            state.isLoading = false
        }),

        builder.addCase(getMessages.pending, (state) => {
            state.messagesLoading = true
        }),
        builder.addCase(getMessages.fulfilled, (state, action) => {
            state.messages = action.payload.data.result
            state.messagesLoading = false
        }),
        builder.addCase(getMessages.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
            state.messagesLoading = false
        }),

        builder.addCase(sendMessage.pending, (state) => {
            state.sending = true
        }),
        builder.addCase(sendMessage.fulfilled, (state, action) => {
            state.sending = false
            state.messages.push(action.payload.data.result)
            const convIdx = state.conversations.findIndex(
                c => c._id === action.payload.data.result.conversation
            )
            if (convIdx !== -1) {
                state.conversations[convIdx].lastMessage = action.payload.data.result
                const [conv] = state.conversations.splice(convIdx, 1)
                state.conversations.unshift(conv)
            }
        }),
        builder.addCase(sendMessage.rejected, (state, action) => {
            state.sending = false
            state.alert = action.payload?.alert ?? {}
        }),

        builder.addCase(searchUsers.fulfilled, (state, action) => {
            state.searchResults = action.payload.data.result
        }),
        builder.addCase(searchUsers.rejected, (state) => {
            state.searchResults = []
        }),

        builder.addCase(getUnreadCount.fulfilled, (state, action) => {
            state.unreadCount = action.payload.data.result
        }),

        builder.addCase(deleteMessageForMe.fulfilled, (state, action) => {
            const deletedId = action.payload.data.result
            state.messages = state.messages.filter(m => m._id !== deletedId)
        }),
        builder.addCase(deleteMessageForMe.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
        }),

        builder.addCase(deleteMessageForAll.fulfilled, (state, action) => {
            const deletedId = action.payload.data.result
            state.messages = state.messages.filter(m => m._id !== deletedId)
        }),
        builder.addCase(deleteMessageForAll.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
        }),

        builder.addCase(deleteConversationForMe.fulfilled, (state, action) => {
            const deletedId = action.payload.data.result
            state.conversations = state.conversations.filter(c => c._id !== deletedId)
            if (state.activeConversation?._id === deletedId) {
                state.activeConversation = null
                state.messages = []
            }
        }),
        builder.addCase(deleteConversationForMe.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
        }),

        builder.addCase(deleteConversationForAll.fulfilled, (state, action) => {
            const deletedId = action.payload.data.result
            state.conversations = state.conversations.filter(c => c._id !== deletedId)
            if (state.activeConversation?._id === deletedId) {
                state.activeConversation = null
                state.messages = []
            }
        }),
        builder.addCase(deleteConversationForAll.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
        }),

        builder.addCase(blockUser.fulfilled, (state, action) => {
            const blockedUserId = action.payload.data.result
            if (state.activeConversation) {
                const hasBlocked = state.activeConversation.participants?.some(
                    p => (p._id || p).toString() === blockedUserId
                )
                if (hasBlocked) {
                    state.activeConversation = null
                    state.messages = []
                }
            }
            state.blockStatus = { iBlocked: true, theyBlocked: false, anyBlocked: true }
            state.alert = action.payload.data.alert ?? {}
        }),
        builder.addCase(blockUser.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
        }),

        builder.addCase(unblockUser.fulfilled, (state, action) => {
            const unblockedId = action.payload.data.result
            state.blockedUsers = state.blockedUsers.filter(u => u._id !== unblockedId)
            state.blockStatus = null
            state.alert = action.payload.data.alert ?? {}
        }),
        builder.addCase(unblockUser.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
        }),

        builder.addCase(getBlockedUsers.fulfilled, (state, action) => {
            state.blockedUsers = action.payload.data.result
        }),
        builder.addCase(getBlockedUsers.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
        }),

        builder.addCase(checkBlocked.fulfilled, (state, action) => {
            state.blockStatus = action.payload.data.result
        }),
        builder.addCase(checkBlocked.rejected, (state, action) => {
            state.blockStatus = null
        })
    },
    reducers: {
        setActiveConversation: (state, action) => {
            state.activeConversation = action.payload
        },
        addMessage: (state, action) => {
            const { message, conversationId } = action.payload
            if (state.activeConversation?._id === conversationId) {
                const exists = state.messages.find(m => m._id === message._id)
                if (!exists) {
                    state.messages.push(message)
                }
            }
            const convIdx = state.conversations.findIndex(c => c._id === conversationId)
            if (convIdx !== -1) {
                state.conversations[convIdx].lastMessage = message
                const [conv] = state.conversations.splice(convIdx, 1)
                state.conversations.unshift(conv)
            }
        },
        updateUnreadCount: (state, action) => {
            state.unreadCount = action.payload
        },
        setTyping: (state, action) => {
            const { conversationId, username } = action.payload
            if (username) {
                state.typing[conversationId] = username
            } else {
                delete state.typing[conversationId]
            }
        },
        clearSearchResults: (state) => {
            state.searchResults = []
        },
        clearAlert: (state) => {
            state.alert = {}
        },
        removeConversation: (state, action) => {
            const conversationId = action.payload
            state.conversations = state.conversations.filter(c => c._id !== conversationId)
            if (state.activeConversation?._id === conversationId) {
                state.activeConversation = null
                state.messages = []
            }
        },
        removeMessage: (state, action) => {
            const messageId = action.payload
            state.messages = state.messages.filter(m => m._id !== messageId)
        },
        clearBlockStatus: (state) => {
            state.blockStatus = null
        }
    }
})

export const {
    setActiveConversation,
    addMessage,
    updateUnreadCount,
    setTyping,
    clearSearchResults,
    clearAlert,
    removeConversation,
    removeMessage,
    clearBlockStatus
} = chatSlice.actions

export default chatSlice.reducer
