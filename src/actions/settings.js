import * as api from '../api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
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

export const userToken = createAsyncThunk('settings/userToken', async (form, thunkAPI) => {
    try {
        const response = await api.userToken(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const getProfile = createAsyncThunk('settings/getProfile', async (form, thunkAPI) => {
    try {
        const response = await api.getProfile(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const updateProfile = createAsyncThunk('settings/updateProfile', async (form, thunkAPI) => {
    try {
        const response = await api.updateProfile(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const updatePassword = createAsyncThunk('settings/updatePassword', async (form, thunkAPI) => {
    try {
        const response = await api.updatePassword(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const updateOptions = createAsyncThunk('settings/updateOptions', async (form, thunkAPI) => {
    try {
        const response = await api.updateOptions(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const sendVerificationEmail = createAsyncThunk('settings/sendVerificationEmail', async (form, thunkAPI) => {
    try {
        const response = await api.sendVerificationEmail(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const verifyEmail = createAsyncThunk('settings/verifyEmail', async (form, thunkAPI) => {
    try {
        const response = await api.verifyEmail(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const getAllUsers = createAsyncThunk('settings/getAllUsers', async (form, thunkAPI) => {
    try {
        const response = await api.getAllUsers(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});


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