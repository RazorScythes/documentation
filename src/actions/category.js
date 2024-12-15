import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data        : {},
    alert       : {},
    isLoading   : false,
    notFound    : false,
    error       : '',
}

export const getCategory = createAsyncThunk('category/getCategory', async (data, thunkAPI) => {
    try {
        const { type, options } = data
        const response = await api.getCategory(type, options)
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

export const newCategory = createAsyncThunk('category/newCategory', async (form, thunkAPI) => {
    try {
        const response = await api.newCategory(form)
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

export const updateCategory = createAsyncThunk('category/updateCategory', async (form, thunkAPI) => {
    try {
        const response = await api.updateCategory(form)
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

export const deleteCategory = createAsyncThunk('category/deleteCategory', async (data, thunkAPI) => {
    try {
        const { id, type } = data
        const response = await api.deleteCategory(id, type)
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

export const deleteMultipleCategory = createAsyncThunk('category/deleteMultipleCategory', async (form, thunkAPI) => {
    try {
        const response = await api.deleteMultipleCategory(form)
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

export const updateCategorySettings = createAsyncThunk('category/updateCategorySettings', async (form, thunkAPI) => {
    try {
        const response = await api.updateCategorySettings(form)
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

export const categorySlice = createSlice({
    name: 'category',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getCategory.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getCategory.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getCategory.rejected, (state, action) => {
            state.alert         = action.payload.alert
            state.isLoading     = false
        }),
        builder.addCase(newCategory.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(newCategory.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(newCategory.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(updateCategory.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateCategory.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateCategory.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteCategory.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteCategory.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteCategory.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(deleteMultipleCategory.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteMultipleCategory.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteMultipleCategory.rejected, (state, action) => {
            state.alert         = action.payload.alert
        }),
        builder.addCase(updateCategorySettings.fulfilled, (state, action) => {
            const filteredObjects = state.data.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.data          = filteredObjects
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateCategorySettings.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateCategorySettings.rejected, (state, action) => {
            state.alert         = action.payload.alert
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = {}
        }
    },
})

export const { clearAlert, clearMailStatus } = categorySlice.actions

export default categorySlice.reducer