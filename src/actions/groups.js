import * as api from '../api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    error: '',
    isLoading: false,
    alert: '',
    variant: '',
    video: {},
    game: {},
    blog: {}
}

export const getUserVideo = createAsyncThunk('uploads/getUserVideo', async (form, thunkAPI) => {
    try {
        const response = await api.getUserVideo(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const getUserGame = createAsyncThunk('uploads/getUserGame', async (form, thunkAPI) => {
    try {
        const response = await api.getUserGame(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const uploadVideo = createAsyncThunk('uploads/uploadVideo', async (form, thunkAPI) => {
    try {
        const response = await api.uploadVideo(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const editVideo = createAsyncThunk('uploads/editVideo', async (form, thunkAPI) => {
    try {
        const response = await api.editVideo(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const editGame = createAsyncThunk('uploads/editGame', async (form, thunkAPI) => {
    try {
        const response = await api.editGame(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const editBlog = createAsyncThunk('uploads/editBlog', async (form, thunkAPI) => {
    try {
        const response = await api.editBlog(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const removeVideo = createAsyncThunk('uploads/removeVideo', async (form, thunkAPI) => {
    try {
        const response = await api.removeVideo(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const bulkRemoveVideo = createAsyncThunk('uploads/bulkRemoveVideo', async (form, thunkAPI) => {
    try {
        const response = await api.bulkRemoveVideo(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const changePrivacyById = createAsyncThunk('uploads/changePrivacyById', async (form, thunkAPI) => {
    try {
        const response = await api.changePrivacyById(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const changeStrictById = createAsyncThunk('uploads/changeStrictById', async (form, thunkAPI) => {
    try {
        const response = await api.changeStrictById(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const changeGamePrivacyById = createAsyncThunk('uploads/changeGamePrivacyById', async (form, thunkAPI) => {
    try {
        const response = await api.changeGamePrivacyById(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const changeGameStrictById = createAsyncThunk('uploads/changeGameStrictById', async (form, thunkAPI) => {
    try {
        const response = await api.changeGameStrictById(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const changeDownloadById = createAsyncThunk('uploads/changeDownloadById', async (form, thunkAPI) => {
    try {
        const response = await api.changeDownloadById(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const uploadGame = createAsyncThunk('uploads/uploadGame', async (form, thunkAPI) => {
    try {
        const response = await api.uploadGame(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const removeGame = createAsyncThunk('uploads/removeGame', async (form, thunkAPI) => {
    try {
        const response = await api.removeGame(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const bulkRemoveGame = createAsyncThunk('uploads/bulkRemoveGame', async (form, thunkAPI) => {
    try {
        const response = await api.bulkRemoveGame(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const uploadBlog = createAsyncThunk('uploads/uploadBlog', async (form, thunkAPI) => {
    try {
        const response = await api.uploadBlog(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const getUserBlog = createAsyncThunk('uploads/getUserBlog', async (form, thunkAPI) => {
    try {
        const response = await api.getUserBlog(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const changeBlogPrivacyById = createAsyncThunk('uploads/changeBlogPrivacyById', async (form, thunkAPI) => {
    try {
        const response = await api.changeBlogPrivacyById(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const changeBlogStrictById = createAsyncThunk('uploads/changeBlogStrictById', async (form, thunkAPI) => {
    try {
        const response = await api.changeBlogStrictById(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const removeBlog = createAsyncThunk('uploads/removeBlog', async (form, thunkAPI) => {
    try {
        const response = await api.removeBlog(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const bulkRemoveBlog = createAsyncThunk('uploads/bulkRemoveBlog', async (form, thunkAPI) => {
    try {
        const response = await api.bulkRemoveBlog(form)
        return response
    }
    catch (err) {
        if(err.response.data)
          return thunkAPI.rejectWithValue(err.response.data);

        return({ 
            variant: 'danger',
            message: "409: there was a problem with the server."
        })
    }
})

export const groupSlice = createSlice({
    name: 'groups',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getUserVideo.fulfilled, (state, action) => {
            state.video = action.payload.data.result
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(getUserVideo.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(getUserGame.fulfilled, (state, action) => {
            state.game = action.payload.data.result
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(getUserGame.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(getUserBlog.fulfilled, (state, action) => {
            state.blog = action.payload.data.result
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(getUserBlog.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(changePrivacyById.fulfilled, (state, action) => {
            // Filtering the objects and replacing the matching ones
            const filteredObjects = state.video.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.video = filteredObjects
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(changePrivacyById.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(changeGamePrivacyById.fulfilled, (state, action) => {
            // Filtering the objects and replacing the matching ones
            const filteredObjects = state.game.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.game = filteredObjects
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(changeGamePrivacyById.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(changeStrictById.fulfilled, (state, action) => {
            // Filtering the objects and replacing the matching ones
            const filteredObjects = state.video.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });
            state.video = filteredObjects
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(changeStrictById.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(changeGameStrictById.fulfilled, (state, action) => {
            // Filtering the objects and replacing the matching ones
            const filteredObjects = state.game.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });
            state.game = filteredObjects
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(changeGameStrictById.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(changeDownloadById.fulfilled, (state, action) => {
            // Filtering the objects and replacing the matching ones
            const filteredObjects = state.video.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.video = filteredObjects
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(changeDownloadById.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(uploadVideo.fulfilled, (state, action) => {
            state.video = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(uploadVideo.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(uploadGame.fulfilled, (state, action) => {
            state.game = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(uploadGame.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(uploadBlog.fulfilled, (state, action) => {
            state.blog = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(uploadBlog.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(editVideo.fulfilled, (state, action) => {
            state.video = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(editVideo.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(editGame.fulfilled, (state, action) => {
            state.game = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(editGame.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(editBlog.fulfilled, (state, action) => {
            state.blog = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(editBlog.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(removeVideo.fulfilled, (state, action) => {
            state.video = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(removeVideo.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(bulkRemoveVideo.fulfilled, (state, action) => {
            state.video = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(bulkRemoveVideo.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(removeGame.fulfilled, (state, action) => {
            state.game = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(removeGame.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(bulkRemoveGame.fulfilled, (state, action) => {
            state.game = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(bulkRemoveGame.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(changeBlogPrivacyById.fulfilled, (state, action) => {
            // Filtering the objects and replacing the matching ones
            const filteredObjects = state.blog.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.blog = filteredObjects
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(changeBlogPrivacyById.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(changeBlogStrictById.fulfilled, (state, action) => {
            // Filtering the objects and replacing the matching ones
            const filteredObjects = state.blog.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });
            state.blog = filteredObjects
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(changeBlogStrictById.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(removeBlog.fulfilled, (state, action) => {
            state.blog = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(removeBlog.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        }),
        builder.addCase(bulkRemoveBlog.fulfilled, (state, action) => {
            state.blog = action.payload.data.result
            state.alert = action.payload.data.message
            state.variant = action.payload.data.variant
            state.error = ''
            state.isLoading = false
        }),
        builder.addCase(bulkRemoveBlog.rejected, (state, action) => {
            state.alert = action.payload.message
            state.variant = action.payload.variant
        })
    },
    reducers: {
      clearAlert: (state) => {
        state.alert = '',
        state.variant = ''
      },
      clearMailStatus: (state) => {
        state.mailStatus = ''
      },
    },
})

export const { clearAlert, clearMailStatus } = groupSlice.actions

export default groupSlice.reducer