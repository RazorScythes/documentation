import * as api from '../api'
import { createSlice } from '@reduxjs/toolkit'
import { requestAPI } from '../api/function'

const initialState = {
    error               : '',
    isLoading           : false,
    alert               : '',
    variant             : '',
    heading             : '',
    paragraph           : '',
    data                : {},
    avatar              : '',
    strict              : false,
    verified            : false,
    verification_status : '',
    tokenResult         : {},
    users               : []
}

export const userToken                                          = await requestAPI('settings/userToken', api.userToken)
export const getProfile                                         = await requestAPI('settings/getProfile', api.getProfile)
export const updateProfile                                      = await requestAPI('settings/updateProfile', api.updateProfile)
export const updatePassword                                     = await requestAPI('settings/updatePassword', api.updatePassword)
export const updateOptions                                      = await requestAPI('settings/updateOptions', api.updateOptions)
export const sendVerificationEmail                              = await requestAPI('settings/sendVerificationEmail', api.sendVerificationEmail)
export const verifyEmail                                        = await requestAPI('settings/verifyEmail', api.verifyEmail)
export const getAllUsers                                        = await requestAPI('settings/getAllUsers', api.getAllUsers)

export const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getAllUsers.fulfilled, (state, action) => {
            state.users                 = action.payload.data.result
            state.error                 = ''
            state.isLoading             = false
            state.notFound              = false
        }),
        builder.addCase(getAllUsers.pending, (state, action) => {
            state.isLoading             = true
        }),
        builder.addCase(getAllUsers.rejected, (state, action) => {
            state.message               = action.payload.message
            state.notFound              = true;
            state.isLoading             = false
        }),

        builder.addCase(userToken.fulfilled, (state, action) => {
            localStorage.setItem('profile', JSON.stringify({ ...action.payload?.data }));
            state.tokenResult           = {...action.payload?.data}
        }),
        builder.addCase(userToken.rejected, (state, action) => {
            if(action.payload.message === "Token has expired.") {
                localStorage.removeItem('profile')
                window.location.href="/login"
            } 
        }),

        builder.addCase(sendVerificationEmail.fulfilled, (state, action) => {
            state.alert                 = action.payload.data.message
            state.variant               = action.payload.data.variant
            state.heading               = action.payload.data.heading
            state.paragraph             = action.payload.data.paragraph
        }),
        builder.addCase(sendVerificationEmail.rejected, (state, action) => {
            state.alert                 = action.payload.message
            state.variant               = action.payload.variant
            state.heading               = action.payload.heading
            state.paragraph             = action.payload.paragraph
        }),

        builder.addCase(verifyEmail.fulfilled, (state, action) => {
            state.verification_status   = action.payload.data.status
        }),
        builder.addCase(verifyEmail.rejected, (state, action) => {
            state.verification_status   = action.payload.status
        }),

        builder.addCase(getProfile.fulfilled, (state, action) => {
            state.data                  = action.payload.data.result
            state.error                 = ''
            state.isLoading             = false
        }),
        builder.addCase(getProfile.rejected, (state, action) => {
            state.alert                 = action.payload.message
            state.variant               = action.payload.variant
        }),

        builder.addCase(updateProfile.fulfilled, (state, action) => {
            state.data                  = action.payload.data.result
            state.alert                 = action.payload.data.alert
            state.variant               = action.payload.data.variant
            state.error                 = ''
            state.isLoading             = false
        }),
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.alert                 = action.payload.message
            state.variant               = action.payload.variant
        }),

        builder.addCase(updatePassword.fulfilled, (state, action) => {
            state.data                  = action.payload.data.result
            state.alert                 = action.payload.data.alert
            state.variant               = action.payload.data.variant
            state.error                 = ''
            state.isLoading             = false
        }),
        builder.addCase(updatePassword.rejected, (state, action) => {
            state.alert                 = action.payload.message
            state.variant               = action.payload.variant
        }),

        builder.addCase(updateOptions.fulfilled, (state, action) => {
            state.data                  = action.payload.data.result
            state.alert                 = action.payload.data.alert
            state.variant               = action.payload.data.variant
            state.error                 = ''
            state.isLoading             = false
        }),
        builder.addCase(updateOptions.rejected, (state, action) => {
            state.alert                 = action.payload.message
            state.variant               = action.payload.variant
        })
    },
    reducers: {
      clearAlert: (state) => {
        state.alert             = '',
        state.variant           = '',
        state.heading           = '',
        state.paragraph         = ''
      },
      clearMailStatus: (state) => {
        state.mailStatus        = ''
      },
    },
})

export const { clearAlert, clearMailStatus } = settingsSlice.actions

export default settingsSlice.reducer