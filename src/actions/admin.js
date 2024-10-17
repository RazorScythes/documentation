import * as api from '../api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { requestAPI } from '../api/function'

const initialState = {
    error: '',
    isLoading: false,
    data: {}
}

export const getOverviewData = await requestAPI('admin/getOverviewData', api.getOverviewData)

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    extraReducers: (builder) => {
      builder.addCase(getOverviewData.pending, (state) => {
        state.isLoading = true
      }),
      builder.addCase(getOverviewData.fulfilled, (state, action) => {
        state.data = action.payload.data
        state.error = ''
        state.isLoading = false
      })
    },
    reducers: {

    },
})
  
// Action creators are generated for each case reducer function
export const {  } = adminSlice.actions
  
export default adminSlice.reducer