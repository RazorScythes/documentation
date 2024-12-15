import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data        : {},
    alert       : {},
    isLoading   : false,
    notFound    : false,
    error       : '',
}

export const getAuthor = createAsyncThunk('author/getAuthor', async (data, thunkAPI) => {
    try {
        const { type, options } = data
        const response = await api.getAuthor(type, options)
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

export const newAuthor = createAsyncThunk('author/newAuthor', async (form, thunkAPI) => {
    try {
        const response = await api.newAuthor(form)
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

export const updateAuthor = createAsyncThunk('author/updateAuthor', async (form, thunkAPI) => {
    try {
        const response = await api.updateAuthor(form)
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

export const deleteAuthor = createAsyncThunk('author/deleteAuthor', async (data, thunkAPI) => {
    try {
        const { id, type } = data
        const response = await api.deleteAuthor(id, type)
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

export const deleteMultipleAuthor = createAsyncThunk('author/deleteMultipleAuthor', async (form, thunkAPI) => {
    try {
        const response = await api.deleteMultipleAuthor(form)
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

export const authorSlice = createSlice({
    name: 'author',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getAuthor.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getAuthor.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getAuthor.rejected, (state, action) => {
            state.alert         = action.payload.alert
            state.isLoading     = false
        }),
        builder.addCase(newAuthor.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(newAuthor.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(newAuthor.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(updateAuthor.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateAuthor.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateAuthor.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteAuthor.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteAuthor.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteAuthor.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteMultipleAuthor.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteMultipleAuthor.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteMultipleAuthor.rejected, (state, action) => {
            state.alert         = action.payload.alert
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = {}
        }
    },
})

export const { clearAlert, clearMailStatus } = authorSlice.actions

export default authorSlice.reducer