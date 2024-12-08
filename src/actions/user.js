import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data        : {},
    alert       : {},
    isLoading   : false,
    notFound    : false,
    error       : '',
}

export const getProfile = createAsyncThunk('user/getProfile', async (data, thunkAPI) => {
    try {
        const response = await api.getProfile()
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

export const updateProfile = createAsyncThunk('user/updateProfile', async (formData, thunkAPI) => {
    try {
        const response = await api.updateProfile(formData)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

const updateProfileStorage = (data) => {
    const { avatar, first_name, last_name, bio } = data;

    const storage = JSON.parse(localStorage.getItem('profile'));

    const updated = JSON.stringify({
        ...storage,
        first_name,
        last_name,
        bio
    });

    if(avatar) {
        localStorage.setItem('avatar', avatar.save)
    }

    localStorage.setItem('profile', updated)
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getProfile.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getProfile.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getProfile.rejected, (state, action) => {
            state.alert         = action.payload?.alert
            state.isLoading     = false
        }),
        builder.addCase(updateProfile.fulfilled, (state, action) => {
            updateProfileStorage(action.payload.data.result);

            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateProfile.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.alert         = action.payload.alert
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = {}
        }
    },
})

export const { clearAlert, clearMailStatus } = userSlice.actions

export default userSlice.reducer