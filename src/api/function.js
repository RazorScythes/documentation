import { createAsyncThunk } from '@reduxjs/toolkit'

export async function requestAPI(thunkName, apiMethod) {
    return createAsyncThunk(thunkName, async (form, thunkAPI) => {
        try {
            const response = await apiMethod(form)
            return response
        }
        catch (err) {
            return thunkAPI.rejectWithValue(err.response.data.message);
        }
    })
}