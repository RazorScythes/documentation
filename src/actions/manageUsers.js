import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data        : [],
    alert       : {},
    isLoading   : false,
    notFound    : false,
    error       : '',
}

export const getAllUsers = createAsyncThunk('manageUsers/getAllUsers', async (_, thunkAPI) => {
    try {
        const response = await api.getAllUsers()
        return response
    }
    catch (err) {
        if(err.response?.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

export const updateUserRole = createAsyncThunk('manageUsers/updateUserRole', async (form, thunkAPI) => {
    try {
        const response = await api.updateUserRole(form)
        return response
    }
    catch (err) {
        if(err.response?.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

export const banUser = createAsyncThunk('manageUsers/banUser', async (form, thunkAPI) => {
    try {
        const response = await api.banUser(form)
        return response
    }
    catch (err) {
        if(err.response?.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

export const unbanUser = createAsyncThunk('manageUsers/unbanUser', async (data, thunkAPI) => {
    try {
        const { id } = data
        const response = await api.unbanUser(id)
        return response
    }
    catch (err) {
        if(err.response?.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

export const deleteUser = createAsyncThunk('manageUsers/deleteUser', async (data, thunkAPI) => {
    try {
        const { id } = data
        const response = await api.deleteUser(id)
        return response
    }
    catch (err) {
        if(err.response?.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({
            alert : {
                variant: 'danger',
                message: "There was a problem with the server."
            }
        })
    }
})

export const manageUsersSlice = createSlice({
    name: 'manageUsers',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getAllUsers.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.isLoading     = false
        }),
        builder.addCase(getAllUsers.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getAllUsers.rejected, (state, action) => {
            state.alert         = action.payload?.alert
            state.isLoading     = false
        }),
        builder.addCase(updateUserRole.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(updateUserRole.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(updateUserRole.rejected, (state, action) => {
            state.alert         = action.payload?.alert
        }),
        builder.addCase(banUser.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(banUser.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(banUser.rejected, (state, action) => {
            state.alert         = action.payload?.alert
        }),
        builder.addCase(unbanUser.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(unbanUser.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(unbanUser.rejected, (state, action) => {
            state.alert         = action.payload?.alert
        }),
        builder.addCase(deleteUser.fulfilled, (state, action) => {
            state.data          = action.payload.data.result
            state.alert         = action.payload.data.alert
        }),
        builder.addCase(deleteUser.pending, (state, action) => {
            state.notFound      = false
        }),
        builder.addCase(deleteUser.rejected, (state, action) => {
            state.alert         = action.payload?.alert
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = {}
        }
    },
})

export const { clearAlert } = manageUsersSlice.actions

export default manageUsersSlice.reducer
