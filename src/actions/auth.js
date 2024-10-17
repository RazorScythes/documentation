import * as api from '../api'
import { createSlice } from '@reduxjs/toolkit'
import { requestAPI } from '../api/function'

const initialState = {
    error       : '',
    isLoading   : false,
    data        : {}
}

export const signin                  = await requestAPI('user/getUser', api.SignIn)

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    extraReducers: (builder) => {
      builder.addCase(signin.pending, (state) => {
          state.isLoading       = true
      }),
      builder.addCase(signin.fulfilled, (state, action) => {
          state.data            = action.payload.data
          state.error           = ''
          state.isLoading       = false
          localStorage.setItem('profile', JSON.stringify({ ...action.payload?.data }));
      }),
      builder.addCase(signin.rejected, (state, action) => {
          state.error           = action.payload
      })
    },
    reducers: {
      logout: (state) => {
        localStorage.removeItem('profile')
        state.error         = ''
        state.isLoading     = false
        state.data          = {}
      }
    },
})
  
export const { logout } = authSlice.actions
  
export default authSlice.reducer