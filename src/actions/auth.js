import * as endpoint from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const initialState = {
    error       : '',
    isLoading   : false,
    data        : {}
}

export const login = createAsyncThunk('user/login', async (form, thunkAPI) => {
    try {
        const response = await endpoint.login(form);
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

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(login.pending, (state) => {
            state.isLoading       = true
        }),
        builder.addCase(login.fulfilled, (state, action) => {
            cookies.set('token', action.payload?.data.token)
            localStorage.setItem('profile', JSON.stringify({ ...action.payload?.data.result }));
            localStorage.setItem('avatar', JSON.stringify(action.payload?.data.result?.avatar));

            state.data            = action.payload.data
            state.error           = ''
            state.isLoading       = false
        }),
        builder.addCase(login.rejected, (state, action) => {
            state.error           = action.payload
        })
    },
    reducers: {
        logout: (state) => {
            cookies.remove('token')
            localStorage.removeItem('profile')

            state.error         = ''
            state.isLoading     = false
            state.data          = {}
        }
    },
})
  
export const { logout } = authSlice.actions
  
export default authSlice.reducer