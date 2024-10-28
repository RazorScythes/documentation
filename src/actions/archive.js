import * as api from '../api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { requestAPI } from '../api/function'

const initialState = {
    error               : '',
    isLoading           : false,
    notFound            : false,
    alert               : '',
    variant             : '',
    data                : {},
    archiveName         : [],
    archiveData         : [],
    avatar              : '',
    message             : '',
    forbiden            : '',
    sideAlert           : {},
}

export const getArchiveNameById = createAsyncThunk('archive/getArchiveNameById', async (form, thunkAPI) => {
    try {
        const response = await api.getArchiveNameById(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data)
            return thunkAPI.rejectWithValue(err.response.data);

        return { 
            variant: 'danger',
            message: "409: there was a problem with the server."
        };
    }
});

export const getArchiveDataById = createAsyncThunk('archive/getArchiveDataById', async (form, thunkAPI) => {
    try {
        const response = await api.getArchiveDataById(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data)
            return thunkAPI.rejectWithValue(err.response.data);

        return { 
            variant: 'danger',
            message: "409: there was a problem with the server."
        };
    }
});

export const newArchiveList = createAsyncThunk('archive/newArchiveList', async (form, thunkAPI) => {
    try {
        const response = await api.newArchiveList(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data)
            return thunkAPI.rejectWithValue(err.response.data);

        return { 
            variant: 'danger',
            message: "409: there was a problem with the server."
        };
    }
});

export const removeArchiveList = createAsyncThunk('archive/removeArchiveList', async (form, thunkAPI) => {
    try {
        const response = await api.removeArchiveList(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data)
            return thunkAPI.rejectWithValue(err.response.data);

        return { 
            variant: 'danger',
            message: "409: there was a problem with the server."
        };
    }
});


export const archiveSlice = createSlice({
    name: 'archive',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getArchiveNameById.fulfilled, (state, action) => {
            state.notFound          = false
            state.archiveName       = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getArchiveNameById.rejected, (state, action) => {
            state.notFound          = false
            state.isLoading         = false
        }),

        builder.addCase(getArchiveDataById.fulfilled, (state, action) => {
            console.log(action.payload.data.result)
            state.notFound          = false
            state.archiveData       = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getArchiveDataById.pending, (state, action) => {
            state.notFound          = false
            state.isLoading         = true
        }),
        builder.addCase(getArchiveDataById.rejected, (state, action) => {
            state.forbiden          = action.payload.forbiden
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
            state.notFound          = action.payload.notFound
            state.isLoading         = false
        }),

        builder.addCase(newArchiveList.fulfilled, (state, action) => {
            state.notFound          = false
            state.archiveName       = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
            state.sideAlert         = action.payload.data.sideAlert
        }),
        builder.addCase(newArchiveList.rejected, (state, action) => {
            state.notFound          = false
            state.isLoading         = false
            state.sideAlert         = action.payload.sideAlert
        }),
        
        builder.addCase(removeArchiveList.fulfilled, (state, action) => {
            state.notFound          = false
            state.archiveName       = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
            state.sideAlert         = action.payload.data.sideAlert
        }),
        builder.addCase(removeArchiveList.rejected, (state, action) => {
            state.notFound          = false
            state.isLoading         = false
            state.sideAlert         = action.payload.sideAlert
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = '',
            state.variant       = ''
            state.sideAlert     = {}
        },
        clearMailStatus: (state) => {
            state.mailStatus    = ''
        },
    },
})

export const { clearAlert, clearMailStatus } = archiveSlice.actions

export default archiveSlice.reducer