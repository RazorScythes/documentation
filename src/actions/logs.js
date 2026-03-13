import * as endpoint from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    error           : '',
    isLoading       : false,
    alert           : {},
    data            : [],
    pagination      : {
        total: 0,
        page: 1,
        limit: 20,
        pages: 0
    },
}

export const getLogs = createAsyncThunk('logs/getLogs', async (params, thunkAPI) => {
    try {
        const response = await endpoint.getLogs(params);
        return response;
    } catch (err) {
        if (err.response && err.response.data)
            return thunkAPI.rejectWithValue(err.response.data);

        return thunkAPI.rejectWithValue({ 
            alert: { variant: 'danger', message: '409: there was a problem with the server.' }
        });
    }
});

export const clearLogs = createAsyncThunk('logs/clearLogs', async (_, thunkAPI) => {
    try {
        const response = await endpoint.clearLogs();
        return response;
    } catch (err) {
        if (err.response && err.response.data)
            return thunkAPI.rejectWithValue(err.response.data);

        return thunkAPI.rejectWithValue({ 
            alert: { variant: 'danger', message: '409: there was a problem with the server.' }
        });
    }
});

export const logsSlice = createSlice({
    name: 'logs',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getLogs.pending, (state) => {
            state.isLoading = true
        }),
        builder.addCase(getLogs.fulfilled, (state, action) => {
            state.data       = action.payload.data.result
            state.pagination = action.payload.data.pagination
            state.error      = ''
            state.isLoading  = false
        }),
        builder.addCase(getLogs.rejected, (state, action) => {
            state.isLoading  = false
            state.alert      = action.payload?.alert || { variant: 'danger', message: 'Failed to load logs' }
        }),
        builder.addCase(clearLogs.fulfilled, (state, action) => {
            state.data       = []
            state.pagination = action.payload.data.pagination
            state.alert      = action.payload.data.alert
        }),
        builder.addCase(clearLogs.rejected, (state, action) => {
            state.alert      = action.payload?.alert || { variant: 'danger', message: 'Failed to clear logs' }
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert = {}
        },
    },
})

export const { clearAlert } = logsSlice.actions

export default logsSlice.reducer
