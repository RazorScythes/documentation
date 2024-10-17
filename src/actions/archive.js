import * as api from '../api'
import { createSlice } from '@reduxjs/toolkit'
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

export const getArchiveNameById                 = await requestAPI('archive/getArchiveNameById', api.getArchiveNameById)
export const getArchiveDataById                 = await requestAPI('archive/getArchiveDataById', api.getArchiveDataById)
export const newArchiveList                     = await requestAPI('archive/newArchiveList', api.newArchiveList)
export const removeArchiveList                  = await requestAPI('archive/removeArchiveList', api.removeArchiveList)

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