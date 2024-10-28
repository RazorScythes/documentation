import * as api from '../api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { requestAPI } from '../api/function'

const initialState = {
    error: '',
    isLoading: false,
    data: {}
}

export const getOverviewData = createAsyncThunk('admin/getOverviewData', async (form, thunkAPI) => {
  try {
      const response = await api.getOverviewData(form);
      return response;
  }
  catch (err) {
      if (err.response && err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

      return { 
          variant: 'danger',
          message: "409: there was a problem with the server."
      };
  }
});

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