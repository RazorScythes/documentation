import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data            : [],
    selected        : null,
    alert           : {},
    isLoading       : false,
    error           : '',
}

export const getPlaylists = createAsyncThunk('playlist/getPlaylists', async (_, thunkAPI) => {
    try {
        const response = await api.getPlaylists()
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'Failed to load playlists' }
        })
    }
})

export const getPlaylistById = createAsyncThunk('playlist/getPlaylistById', async (id, thunkAPI) => {
    try {
        const response = await api.getPlaylistById(id)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'Failed to load playlist' }
        })
    }
})

export const createPlaylist = createAsyncThunk('playlist/createPlaylist', async (formData, thunkAPI) => {
    try {
        const response = await api.createPlaylist(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'Failed to create playlist' }
        })
    }
})

export const updatePlaylist = createAsyncThunk('playlist/updatePlaylist', async (formData, thunkAPI) => {
    try {
        const response = await api.updatePlaylist(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'Failed to update playlist' }
        })
    }
})

export const toggleVideoInPlaylist = createAsyncThunk('playlist/toggleVideo', async (formData, thunkAPI) => {
    try {
        const response = await api.toggleVideoInPlaylist(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'Failed to update playlist' }
        })
    }
})

export const removeVideoFromPlaylist = createAsyncThunk('playlist/removeVideo', async (formData, thunkAPI) => {
    try {
        const response = await api.removeVideoFromPlaylist(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'Failed to remove video' }
        })
    }
})

export const deletePlaylist = createAsyncThunk('playlist/deletePlaylist', async (id, thunkAPI) => {
    try {
        const response = await api.deletePlaylist(id)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'Failed to delete playlist' }
        })
    }
})

export const playlistSlice = createSlice({
    name: 'playlist',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getPlaylists.pending, (state) => {
            state.isLoading = true
        }),
        builder.addCase(getPlaylists.fulfilled, (state, action) => {
            state.data      = action.payload.data.result
            state.isLoading = false
        }),
        builder.addCase(getPlaylists.rejected, (state, action) => {
            state.alert     = action.payload?.alert || {}
            state.isLoading = false
        }),
        builder.addCase(getPlaylistById.fulfilled, (state, action) => {
            state.selected  = action.payload.data.result
        }),
        builder.addCase(createPlaylist.fulfilled, (state, action) => {
            state.data      = action.payload.data.result
            state.alert     = action.payload.data.alert
        }),
        builder.addCase(createPlaylist.rejected, (state, action) => {
            state.alert     = action.payload?.alert || {}
        }),
        builder.addCase(updatePlaylist.fulfilled, (state, action) => {
            state.data      = action.payload.data.result
            state.alert     = action.payload.data.alert
        }),
        builder.addCase(updatePlaylist.rejected, (state, action) => {
            state.alert     = action.payload?.alert || {}
        }),
        builder.addCase(toggleVideoInPlaylist.fulfilled, (state, action) => {
            state.data      = action.payload.data.result
            state.alert     = action.payload.data.alert
        }),
        builder.addCase(toggleVideoInPlaylist.rejected, (state, action) => {
            state.alert     = action.payload?.alert || {}
        }),
        builder.addCase(removeVideoFromPlaylist.fulfilled, (state, action) => {
            state.data      = action.payload.data.result
            state.alert     = action.payload.data.alert
        }),
        builder.addCase(removeVideoFromPlaylist.rejected, (state, action) => {
            state.alert     = action.payload?.alert || {}
        }),
        builder.addCase(deletePlaylist.fulfilled, (state, action) => {
            state.data      = action.payload.data.result
            state.alert     = action.payload.data.alert
        }),
        builder.addCase(deletePlaylist.rejected, (state, action) => {
            state.alert     = action.payload?.alert || {}
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert = {}
        },
    },
})

export const { clearAlert } = playlistSlice.actions

export default playlistSlice.reducer
