import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    docs        : {},
    data        : {},
    alert       : {},
    isLoading   : false,
    notFound    : false,
    error       : '',
}

export const getDocs = createAsyncThunk('docs/getDocs', async (data, thunkAPI) => {
    try {
        const response = await api.getDocs()
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

export const getDocsById = createAsyncThunk('docs/getDocsById', async (data, thunkAPI) => {
    try {
        const { category } = data;

        const response = await api.getDocsById(category)
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

export const newDocs = createAsyncThunk('docs/newDocs', async (form, thunkAPI) => {
    try {
        const response = await api.newDocs(form)
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

export const updateDocsSettings = createAsyncThunk('docs/updateDocsSettings', async (form, thunkAPI) => {
    try {
        const response = await api.updateDocsSettings(form)
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

export const updateDocs = createAsyncThunk('docs/updateDocs', async (form, thunkAPI) => {
    try {
        const response = await api.updateDocs(form)
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

export const deleteDocs = createAsyncThunk('docs/deleteDocs', async (data, thunkAPI) => {
    try {
        const { id } = data
        const response = await api.deleteDocs(id)
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

export const deleteMultipleDocs = createAsyncThunk('docs/deleteMultipleDocs', async (form, thunkAPI) => {
    try {
        const response = await api.deleteMultipleDocs(form)
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

export const docsSlice = createSlice({
    name: 'docs',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getDocsById.fulfilled, (state, action) => {
            state.docs          = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getDocsById.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getDocsById.rejected, (state, action) => {
            state.alert         = action.payload.alert
            state.isLoading     = false
        }),
        builder.addCase(getDocs.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getDocs.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getDocs.rejected, (state, action) => {
            state.alert         = action.payload.alert
            state.isLoading     = false
        }),
        builder.addCase(newDocs.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(newDocs.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(newDocs.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(updateDocsSettings.fulfilled, (state, action) => {
            const filteredObjects = state.data.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.data          = filteredObjects
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateDocsSettings.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateDocsSettings.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(updateDocs.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateDocs.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateDocs.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteDocs.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteDocs.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteDocs.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteMultipleDocs.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteMultipleDocs.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteMultipleDocs.rejected, (state, action) => {
            state.alert         = action.payload.alert
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = {}
        }
    },
})

export const { clearAlert, clearMailStatus } = docsSlice.actions

export default docsSlice.reducer