import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data        : {},
    alert       : {},
    isLoading   : false,
    notFound    : false,
    error       : '',
}

export const getTags = createAsyncThunk('tags/getTags', async (data, thunkAPI) => {
    try {
        const { type, options } = data
        const response = await api.getTags(type, options)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const newTags = createAsyncThunk('tags/newTags', async (form, thunkAPI) => {
    try {
        const response = await api.newTags(form)
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

export const updateTags = createAsyncThunk('tags/updateTags', async (form, thunkAPI) => {
    try {
        const response = await api.updateTags(form)
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

export const deleteTags = createAsyncThunk('tags/deleteTags', async (data, thunkAPI) => {
    try {
        const { id, type } = data
        const response = await api.deleteTags(id, type)
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

export const deleteMultipleTags = createAsyncThunk('tags/deleteMultipleTags', async (form, thunkAPI) => {
    try {
        const response = await api.deleteMultipleTags(form)
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

export const tagsSlice = createSlice({
    name: 'tags',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getTags.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getTags.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getTags.rejected, (state, action) => {
            state.alert         = action.payload.alert
            state.isLoading     = false
        }),
        builder.addCase(newTags.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(newTags.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(newTags.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(updateTags.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateTags.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateTags.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteTags.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteTags.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteTags.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteMultipleTags.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteMultipleTags.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteMultipleTags.rejected, (state, action) => {
            state.alert         = action.payload.alert
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = {}
        }
    },
})

export const { clearAlert, clearMailStatus } = tagsSlice.actions

export default tagsSlice.reducer