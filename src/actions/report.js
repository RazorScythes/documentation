import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data: [],
    pagination: {},
    alert: {},
    isLoading: false
}

export const createReport = createAsyncThunk('report/createReport', async (formData, thunkAPI) => {
    try {
        const response = await api.createReport(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const getReports = createAsyncThunk('report/getReports', async (params, thunkAPI) => {
    try {
        const response = await api.getReports(params)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const updateReportStatus = createAsyncThunk('report/updateReportStatus', async (formData, thunkAPI) => {
    try {
        const response = await api.updateReportStatus(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const deleteReport = createAsyncThunk('report/deleteReport', async (id, thunkAPI) => {
    try {
        const response = await api.deleteReport(id)
        return { ...response, deletedId: id }
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({
            alert: { variant: 'danger', message: 'There was a problem with the server.' }
        })
    }
})

export const reportSlice = createSlice({
    name: 'report',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(createReport.fulfilled, (state, action) => {
            state.alert = action.payload.data.alert
            state.isLoading = false
        }),
        builder.addCase(createReport.pending, (state) => {
            state.isLoading = true
        }),
        builder.addCase(createReport.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
            state.isLoading = false
        }),
        builder.addCase(getReports.fulfilled, (state, action) => {
            state.data = action.payload.data.result
            state.pagination = action.payload.data.pagination
            state.isLoading = false
        }),
        builder.addCase(getReports.pending, (state) => {
            state.isLoading = true
        }),
        builder.addCase(getReports.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
            state.isLoading = false
        }),
        builder.addCase(updateReportStatus.fulfilled, (state, action) => {
            const updated = action.payload.data.result
            state.data = state.data.map(r => r._id === updated._id ? updated : r)
            state.alert = action.payload.data.alert
            state.isLoading = false
        }),
        builder.addCase(updateReportStatus.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
            state.isLoading = false
        }),
        builder.addCase(deleteReport.fulfilled, (state, action) => {
            state.data = state.data.filter(r => r._id !== action.payload.deletedId)
            state.alert = action.payload.data.alert
            state.isLoading = false
        }),
        builder.addCase(deleteReport.rejected, (state, action) => {
            state.alert = action.payload?.alert ?? {}
            state.isLoading = false
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert = {}
        }
    }
})

export const { clearAlert } = reportSlice.actions

export default reportSlice.reducer
