import * as api from '../api'
import { createSlice } from '@reduxjs/toolkit'
import { requestAPI } from '../api/function'

const initialState = {
    error           : '',
    isLoading       : false,
    alert           : '',
    variant         : '',
    data            : {},
}

export const getLogs                        = await requestAPI('logs/getLogs', api.getLogs)

export const logsSlice = createSlice({
    name: 'logs',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getLogs.fulfilled, (state, action) => {
            state.data      = action.payload.data.result
            state.error     = ''
            state.isLoading = false
        }),
        builder.addCase(getLogs.rejected, (state, action) => {
            state.alert     = action.payload.message
            state.variant   = action.payload.variant
        })
    },
    reducers: {
      clearAlert: (state) => {
        state.alert         = '',
        state.variant       = ''
      },
      clearMailStatus: (state) => {
        state.mailStatus    = ''
      },
    },
})

export const { clearAlert, clearMailStatus } = logsSlice.actions

export default logsSlice.reducer