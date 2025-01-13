import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data        : {},
    alert       : {},
    comments    : [],
    videoList   : {},
    isLoading   : false,
    notFound    : false,
    error       : '',
    forbiden    : ''
}

export const getVideoById = createAsyncThunk('watch/getVideoById', async (data, thunkAPI) => {
    try {
        const { id, access_key } = data;

        const response = await api.getVideoById(id, access_key)
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

export const getVideoList = createAsyncThunk('watch/getVideoList', async (data, thunkAPI) => {
    try {
        const { id } = data;

        const response = await api.getVideoList(id)
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

export const getVideoComment = createAsyncThunk('watch/getVideoComment', async (data, thunkAPI) => {
    try {
        const { id } = data;

        const response = await api.getVideoComment(id)
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

export const addVideoComment = createAsyncThunk('watch/addVideoComment', async (formData, thunkAPI) => {
    try {
        const response = await api.addVideoComment(formData)
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

export const updateVideoComment = createAsyncThunk('watch/updateVideoComment', async (formData, thunkAPI) => {
    try {
        const response = await api.updateVideoComment(formData)
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

export const deleteVideoComment = createAsyncThunk('watch/deleteVideoComment', async (data, thunkAPI) => {
    try {
        const { id, video_id } = data;

        const response = await api.deleteVideoComment(id, video_id)
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

export const watchSlice = createSlice({
    name: 'watch',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getVideoById.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getVideoById.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getVideoById.rejected, (state, action) => {
            state.alert         = action.payload?.alert ?? {}
            state.notFound      = action.payload.notFound
            state.forbiden      = action.payload.forbiden
            state.isLoading     = false
        }),
        builder.addCase(getVideoList.fulfilled, (state, action) => {
            state.videoList     = action.payload.data.result
        }),
        builder.addCase(getVideoList.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(getVideoComment.fulfilled, (state, action) => {
            state.comments      = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getVideoComment.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(addVideoComment.fulfilled, (state, action) => {
            state.comments      = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(addVideoComment.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(updateVideoComment.fulfilled, (state, action) => {
            state.comments      = action.payload.data.result
        }),
        builder.addCase(updateVideoComment.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateVideoComment.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteVideoComment.fulfilled, (state, action) => {
            state.comments      = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteVideoComment.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteVideoComment.rejected, (state, action) => {
            state.alert         = action.payload.alert
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = {}
        }
    },
})

export const { clearAlert, clearMailStatus } = watchSlice.actions

export default watchSlice.reducer