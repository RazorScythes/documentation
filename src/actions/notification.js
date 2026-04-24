import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    notifications   : [],
    unreadCount     : 0,
    total           : 0,
    page            : 1,
    totalPages      : 0,
    isLoading       : false,
    error           : ''
}

export const getNotifications = createAsyncThunk('notification/getNotifications', async (params, thunkAPI) => {
    try {
        const response = await api.getNotifications(params)
        return response.data
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ message: 'Failed to fetch notifications' })
    }
})

export const getUnreadCount = createAsyncThunk('notification/getUnreadCount', async (_, thunkAPI) => {
    try {
        const response = await api.getUnreadNotificationCount()
        return response.data
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ message: 'Failed to fetch unread count' })
    }
})

export const markAsRead = createAsyncThunk('notification/markAsRead', async (id, thunkAPI) => {
    try {
        const response = await api.markNotificationAsRead(id)
        return response.data
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ message: 'Failed to mark as read' })
    }
})

export const markAllAsRead = createAsyncThunk('notification/markAllAsRead', async (_, thunkAPI) => {
    try {
        const response = await api.markAllNotificationsAsRead()
        return response.data
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ message: 'Failed to mark all as read' })
    }
})

export const removeNotification = createAsyncThunk('notification/removeNotification', async (id, thunkAPI) => {
    try {
        const response = await api.deleteNotification(id)
        return { ...response.data, id }
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ message: 'Failed to delete notification' })
    }
})

export const clearAll = createAsyncThunk('notification/clearAll', async (_, thunkAPI) => {
    try {
        const response = await api.clearAllNotifications()
        return response.data
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ message: 'Failed to clear notifications' })
    }
})

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addRealtimeNotification: (state, action) => {
            state.notifications.unshift(action.payload.notification)
            state.unreadCount = action.payload.unreadCount ?? state.unreadCount + 1
            state.total += 1
        },
        setUnreadCount: (state, action) => {
            state.unreadCount = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(getNotifications.pending, (state) => {
            state.isLoading = true
        })
        .addCase(getNotifications.fulfilled, (state, action) => {
            state.isLoading = false
            if (action.meta.arg?.page > 1) {
                state.notifications = [...state.notifications, ...action.payload.result]
            } else {
                state.notifications = action.payload.result
            }
            state.unreadCount = action.payload.unreadCount
            state.total = action.payload.total
            state.page = action.payload.page
            state.totalPages = action.payload.totalPages
        })
        .addCase(getNotifications.rejected, (state) => {
            state.isLoading = false
        })

        .addCase(getUnreadCount.fulfilled, (state, action) => {
            state.unreadCount = action.payload.unreadCount
        })

        .addCase(markAsRead.fulfilled, (state, action) => {
            const idx = state.notifications.findIndex(n => n._id === action.payload.result?._id)
            if (idx !== -1) state.notifications[idx].read = true
            state.unreadCount = action.payload.unreadCount
        })

        .addCase(markAllAsRead.fulfilled, (state) => {
            state.notifications = state.notifications.map(n => ({ ...n, read: true }))
            state.unreadCount = 0
        })

        .addCase(removeNotification.fulfilled, (state, action) => {
            state.notifications = state.notifications.filter(n => n._id !== action.payload.id)
            state.unreadCount = action.payload.unreadCount
            state.total -= 1
        })

        .addCase(clearAll.fulfilled, (state) => {
            state.notifications = []
            state.unreadCount = 0
            state.total = 0
        })
    }
})

export const { addRealtimeNotification, setUnreadCount } = notificationSlice.actions
export default notificationSlice.reducer
