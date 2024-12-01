import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data        : {},
    alert       : {},
    isLoading   : false,
    notFound    : false,
    error       : '',
}

export const getUserVideos = createAsyncThunk('videos/getUserVideos', async (form, thunkAPI) => {
    try {
        const response = await api.getUserVideos(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

export const newVideo = createAsyncThunk('videos/newVideo', async (form, thunkAPI) => {
    try {
        const response = await api.newVideo(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

export const updateVideo = createAsyncThunk('videos/updateVideo', async (form, thunkAPI) => {
    try {
        const response = await api.updateVideo(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

export const updateVideoSettings = createAsyncThunk('videos/updateVideoSettings', async (form, thunkAPI) => {
    try {
        const response = await api.updateVideoSettings(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

export const videosSlice = createSlice({
    name: 'videos',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getUserVideos.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getUserVideos.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getUserVideos.rejected, (state, action) => {
            state.alert         = action.payload.alert
            state.isLoading     = false
        }),
        builder.addCase(newVideo.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(newVideo.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(newVideo.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(updateVideo.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateVideo.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateVideo.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(updateVideoSettings.fulfilled, (state, action) => {
            const filteredObjects = state.data.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.data          = filteredObjects
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateVideoSettings.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateVideoSettings.rejected, (state, action) => {
            state.alert         = action.payload.alert
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = {}
        }
    },
})

export const { clearAlert, clearMailStatus } = videosSlice.actions

export default videosSlice.reducer