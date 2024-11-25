import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data        : {},
    alert       : {},
    isLoading   : false,
    notFound    : false,
    error       : '',
}

export const getGroups = createAsyncThunk('groups/getGroups', async (data, thunkAPI) => {
    try {
        const { id, type } = data
        const response = await api.getGroups(id, type)
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

export const newGroups = createAsyncThunk('groups/newGroups', async (form, thunkAPI) => {
    try {
        const response = await api.newGroups(form)
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

export const updateGroups = createAsyncThunk('groups/updateGroups', async (form, thunkAPI) => {
    try {
        const response = await api.updateGroups(form)
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

export const deleteGroups = createAsyncThunk('groups/deleteGroups', async (data, thunkAPI) => {
    try {
        const { id, user, type } = data
        const response = await api.deleteGroups(id, user, type)
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

export const deleteMultipleGroups = createAsyncThunk('groups/deleteMultipleGroups', async (form, thunkAPI) => {
    try {
        const response = await api.deleteMultipleGroups(form)
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

export const groupSlice = createSlice({
    name: 'groups',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getGroups.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getGroups.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getGroups.rejected, (state, action) => {
            state.alert         = action.payload.alert
            state.isLoading     = false
        }),
        builder.addCase(newGroups.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(newGroups.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(newGroups.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(updateGroups.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateGroups.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateGroups.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteGroups.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteGroups.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteGroups.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteMultipleGroups.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteMultipleGroups.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteMultipleGroups.rejected, (state, action) => {
            state.alert         = action.payload.alert
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = {}
        }
    },
})

export const { clearAlert, clearMailStatus } = groupSlice.actions

export default groupSlice.reducer