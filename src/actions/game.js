import * as api from '../api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { requestAPI } from '../api/function'

const initialState = {
    error               : '',
    isLoading           : false,
    notFound            : false,
    alert               : '',
    variant             : '',
    data                : {},
    games               : [],
    comments            : [],
    relatedGames        : [],
    avatar              : '',
    message             : '',
    forbiden            : '',
    sideAlert           : {},
    tagsCount           : [],
    categoriesCount     : [],
    recentGameBlog      : []
}

export const getGameByID = createAsyncThunk('game/getGameByID', async (form, thunkAPI) => {
    try {
        const response = await api.getGameByID(form);
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

export const getGames = createAsyncThunk('game/getGames', async (form, thunkAPI) => {
    try {
        const response = await api.getGames(form);
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

export const getRelatedGames = createAsyncThunk('game/getRelatedGames', async (form, thunkAPI) => {
    try {
        const response = await api.getRelatedGames(form);
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

export const addRatings = createAsyncThunk('game/addRatings', async (form, thunkAPI) => {
    try {
        const response = await api.addRatings(form);
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

export const addRatingsRelated = createAsyncThunk('game/addRatingsRelated', async (form, thunkAPI) => {
    try {
        const response = await api.addRatings(form);
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

export const addOneDownload = createAsyncThunk('game/addOneDownload', async (form, thunkAPI) => {
    try {
        const response = await api.addOneDownload(form);
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

export const updateGameAccessKey = createAsyncThunk('game/updateGameAccessKey', async (form, thunkAPI) => {
    try {
        const response = await api.updateGameAccessKey(form);
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

export const countTags = createAsyncThunk('game/countTags', async (form, thunkAPI) => {
    try {
        const response = await api.countTags(form);
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

export const categoriesCount = createAsyncThunk('game/categoriesCount', async (form, thunkAPI) => {
    try {
        const response = await api.categoriesCount(form);
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

export const getGameByTag = createAsyncThunk('game/getGameByTag', async (form, thunkAPI) => {
    try {
        const response = await api.getGameByTag(form);
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

export const getGameByDeveloper = createAsyncThunk('game/getGameByDeveloper', async (form, thunkAPI) => {
    try {
        const response = await api.getGameByDeveloper(form);
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

export const getGameBySearchKey = createAsyncThunk('game/getGameBySearchKey', async (form, thunkAPI) => {
    try {
        const response = await api.getGameBySearchKey(form);
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

export const getRecentGameBlog = createAsyncThunk('game/getRecentGameBlog', async (form, thunkAPI) => {
    try {
        const response = await api.getRecentGameBlog(form);
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

export const addRecentGamingBlogLikes = createAsyncThunk('game/addRecentGamingBlogLikes', async (form, thunkAPI) => {
    try {
        const response = await api.addRecentGamingBlogLikes(form);
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

export const getGameComments = createAsyncThunk('game/getGameComments', async (form, thunkAPI) => {
    try {
        const response = await api.getGameComments(form);
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

export const uploadGameComment = createAsyncThunk('game/uploadGameComment', async (form, thunkAPI) => {
    try {
        const response = await api.uploadGameComment(form);
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

export const removeGameComment = createAsyncThunk('game/removeGameComment', async (form, thunkAPI) => {
    try {
        const response = await api.removeGameComment(form);
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


export const gameSlice = createSlice({
    name: 'game',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getGameByID.fulfilled, (state, action) => {
            state.notFound          = false
            state.data              = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
            state.forbiden          = action.payload.data.forbiden
        }),
        builder.addCase(getGameByID.pending, (state, action) => {
            state.notFound          = false
            state.isLoading         = true
        }),
        builder.addCase(getGameByID.rejected, (state, action) => {
            state.forbiden          = action.payload.forbiden
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
            state.notFound          = action.payload.notFound
            state.isLoading         = false
        }),

        builder.addCase(getGameByTag.fulfilled, (state, action) => {
            state.games             = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getGameByTag.rejected, (state, action) => {
            state.message           = action.payload.message
        }),

        builder.addCase(getGameByDeveloper.fulfilled, (state, action) => {
            state.games             = action.payload.data.result
            state.tagsCount         = action.payload.data.tags
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getGameByDeveloper.rejected, (state, action) => {
            state.message           = action.payload.message
        }),

        builder.addCase(getGameBySearchKey.fulfilled, (state, action) => {
            state.games             = action.payload.data.result
            state.tagsCount         = action.payload.data.tags
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getGameBySearchKey.rejected, (state, action) => {
            state.message           = action.payload.message
        }),

        builder.addCase(getRelatedGames.fulfilled, (state, action) => {
            state.relatedGames      = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getRelatedGames.rejected, (state, action) => {
            state.message           = action.payload.message
        }),

        builder.addCase(getGames.fulfilled, (state, action) => {
            state.games             = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getGames.rejected, (state, action) => {
            state.message = action.payload.message
        }),
        
        builder.addCase(addRatings.fulfilled, (state, action) => {
            const filteredObjects = state.games.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.games             = filteredObjects
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(addRatings.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(addRatingsRelated.fulfilled, (state, action) => {
            const filteredObjects = state.relatedGames.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.relatedGames      = filteredObjects
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(addRatingsRelated.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),
        
        builder.addCase(countTags.fulfilled, (state, action) => {
            state.tagsCount         = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(countTags.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(categoriesCount.fulfilled, (state, action) => {
            state.categoriesCount   = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(categoriesCount.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(getRecentGameBlog.fulfilled, (state, action) => {
            state.recentGameBlog    = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getRecentGameBlog.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(addRecentGamingBlogLikes.fulfilled, (state, action) => {
            state.notFound          = false
            state.recentGameBlog    = action.payload.data.result
            state.error             = ''
        }),
        builder.addCase(addRecentGamingBlogLikes.rejected, (state, action) => {
            console.log("failed to like blog post")
        }),

        builder.addCase(getGameComments.fulfilled, (state, action) => {
            state.comments          = action.payload.data.comments
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getGameComments.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(removeGameComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.comments
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(removeGameComment.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(uploadGameComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.comments
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(uploadGameComment.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        })
    },
    reducers: {
      clearAlert: (state) => {
        state.alert             = '',
        state.variant           = ''
        state.sideAlert         = {}
      },
      clearMailStatus: (state) => {
        state.mailStatus        = ''
      },
    },
})

export const { clearAlert, clearMailStatus } = gameSlice.actions

export default gameSlice.reducer