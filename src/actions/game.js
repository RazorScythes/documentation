import * as api from '../api'
import * as endpoint from '../endpoint'
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
    gamesLoading        : false,
    comments            : [],
    relatedGames        : [],
    avatar              : '',
    message             : '',
    forbiden            : '',
    sideAlert           : {},
    tagsCount           : [],
    categoriesCount     : [],
    recentGameBlog      : [],
    favoriteGames       : [],
    favoriteGamesData   : []
}

const rejectErr = (thunkAPI, err) => {
    if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
    return thunkAPI.rejectWithValue({ variant: 'danger', message: 'There was a problem with the server.' })
}

export const getGameByID = createAsyncThunk('game/getGameByID', async (form, thunkAPI) => {
    try { return await api.getGameByID(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getGames = createAsyncThunk('game/getGames', async (form, thunkAPI) => {
    try { return await api.getGames(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getRelatedGames = createAsyncThunk('game/getRelatedGames', async (form, thunkAPI) => {
    try { return await api.getRelatedGames(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const addRatings = createAsyncThunk('game/addRatings', async (form, thunkAPI) => {
    try { return await api.addRatings(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const addRatingsRelated = createAsyncThunk('game/addRatingsRelated', async (form, thunkAPI) => {
    try { return await api.addRatings(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const addOneDownload = createAsyncThunk('game/addOneDownload', async (form, thunkAPI) => {
    try { return await api.addOneDownload(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const updateGameAccessKey = createAsyncThunk('game/updateGameAccessKey', async (form, thunkAPI) => {
    try { return await api.updateGameAccessKey(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const countTags = createAsyncThunk('game/countTags', async (form, thunkAPI) => {
    try { return await api.countTags(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const categoriesCount = createAsyncThunk('game/categoriesCount', async (form, thunkAPI) => {
    try { return await api.categoriesCount(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getGameByTag = createAsyncThunk('game/getGameByTag', async (form, thunkAPI) => {
    try { return await api.getGameByTag(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getGameByDeveloper = createAsyncThunk('game/getGameByDeveloper', async (form, thunkAPI) => {
    try { return await api.getGameByDeveloper(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getGameBySearchKey = createAsyncThunk('game/getGameBySearchKey', async (form, thunkAPI) => {
    try { return await api.getGameBySearchKey(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getRecentGameBlog = createAsyncThunk('game/getRecentGameBlog', async (form, thunkAPI) => {
    try { return await api.getRecentGameBlog(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const addRecentGamingBlogLikes = createAsyncThunk('game/addRecentGamingBlogLikes', async (form, thunkAPI) => {
    try { return await api.addRecentGamingBlogLikes(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const toggleFavoriteGame = createAsyncThunk('game/toggleFavoriteGame', async (form, thunkAPI) => {
    try { return await api.toggleFavoriteGame(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getFavoriteGames = createAsyncThunk('game/getFavoriteGames', async (form, thunkAPI) => {
    try { return await api.getFavoriteGames(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getFavoriteGamesPopulated = createAsyncThunk('game/getFavoriteGamesPopulated', async (form, thunkAPI) => {
    try { return await api.getFavoriteGames({ ...form, populate: true }) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getGameComments = createAsyncThunk('game/getGameComments', async (data, thunkAPI) => {
    try {
        const { gameId } = data;
        return await endpoint.getGameComment(gameId);
    } catch (err) { return rejectErr(thunkAPI, err) }
});

export const addGameComment = createAsyncThunk('game/addGameComment', async (formData, thunkAPI) => {
    try { return await endpoint.addGameComment(formData) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const updateGameComment = createAsyncThunk('game/updateGameComment', async (formData, thunkAPI) => {
    try { return await endpoint.updateGameComment(formData) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const deleteGameComment = createAsyncThunk('game/deleteGameComment', async (data, thunkAPI) => {
    try {
        const { id, game_id } = data;
        return await endpoint.deleteGameComment(id, game_id);
    } catch (err) { return rejectErr(thunkAPI, err) }
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
            state.forbiden          = ''
            state.isLoading         = true
        }),
        builder.addCase(getGameByID.rejected, (state, action) => {
            state.forbiden          = action.payload?.forbiden || ''
            state.alert             = action.payload?.message || ''
            state.variant           = action.payload?.variant || ''
            state.notFound          = action.payload?.notFound || false
            state.isLoading         = false
        }),

        builder.addCase(getGameByTag.pending, (state) => { state.gamesLoading = true }),
        builder.addCase(getGameByTag.fulfilled, (state, action) => {
            state.games             = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
            state.gamesLoading      = false
        }),
        builder.addCase(getGameByTag.rejected, (state, action) => {
            state.message           = action.payload?.message || ''
            state.gamesLoading      = false
        }),

        builder.addCase(getGameByDeveloper.pending, (state) => { state.gamesLoading = true }),
        builder.addCase(getGameByDeveloper.fulfilled, (state, action) => {
            state.games             = action.payload.data.result
            state.tagsCount         = action.payload.data.tags || []
            state.error             = ''
            state.isLoading         = false
            state.gamesLoading      = false
        }),
        builder.addCase(getGameByDeveloper.rejected, (state, action) => {
            state.message           = action.payload?.message || ''
            state.gamesLoading      = false
        }),

        builder.addCase(getGameBySearchKey.pending, (state) => { state.gamesLoading = true }),
        builder.addCase(getGameBySearchKey.fulfilled, (state, action) => {
            state.games             = action.payload.data.result
            state.tagsCount         = action.payload.data.tags || []
            state.error             = ''
            state.isLoading         = false
            state.gamesLoading      = false
        }),
        builder.addCase(getGameBySearchKey.rejected, (state, action) => {
            state.message           = action.payload?.message || ''
            state.gamesLoading      = false
        }),

        builder.addCase(getRelatedGames.fulfilled, (state, action) => {
            state.relatedGames      = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getRelatedGames.rejected, (state, action) => {
            state.message           = action.payload?.message || ''
        }),

        builder.addCase(getGames.pending, (state) => { state.gamesLoading = true }),
        builder.addCase(getGames.fulfilled, (state, action) => {
            state.games             = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
            state.gamesLoading      = false
        }),
        builder.addCase(getGames.rejected, (state, action) => {
            state.message           = action.payload?.message || ''
            state.gamesLoading      = false
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
            state.alert             = action.payload?.message || ''
            state.variant           = action.payload?.variant || ''
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
            state.alert             = action.payload?.message || ''
            state.variant           = action.payload?.variant || ''
        }),
        
        builder.addCase(countTags.fulfilled, (state, action) => {
            state.tagsCount         = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(countTags.rejected, (state, action) => {
            state.alert             = action.payload?.message || ''
            state.variant           = action.payload?.variant || ''
        }),

        builder.addCase(categoriesCount.fulfilled, (state, action) => {
            state.categoriesCount   = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(categoriesCount.rejected, (state, action) => {
            state.alert             = action.payload?.message || ''
            state.variant           = action.payload?.variant || ''
        }),

        builder.addCase(getRecentGameBlog.fulfilled, (state, action) => {
            state.recentGameBlog    = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getRecentGameBlog.rejected, (state, action) => {
            state.alert             = action.payload?.message || ''
            state.variant           = action.payload?.variant || ''
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
            state.comments          = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getGameComments.rejected, (state, action) => {
            state.alert             = action.payload?.alert?.message || action.payload?.message || ''
            state.variant           = action.payload?.alert?.variant || action.payload?.variant || ''
        }),

        builder.addCase(addGameComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.result
            state.sideAlert         = action.payload.data.alert || {}
        }),
        builder.addCase(addGameComment.rejected, (state, action) => {
            state.alert             = action.payload?.alert?.message || ''
        }),

        builder.addCase(updateGameComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.result
        }),
        builder.addCase(updateGameComment.rejected, (state, action) => {
            state.alert             = action.payload?.alert?.message || ''
        }),

        builder.addCase(deleteGameComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.result
            state.sideAlert         = action.payload.data.alert || {}
        }),
        builder.addCase(deleteGameComment.rejected, (state, action) => {
            state.alert             = action.payload?.alert?.message || ''
        }),

        builder.addCase(toggleFavoriteGame.fulfilled, (state, action) => {
            state.favoriteGames     = action.payload.data.result
        }),
        builder.addCase(toggleFavoriteGame.rejected, (state, action) => {
            state.alert             = action.payload?.message || ''
            state.variant           = action.payload?.variant || ''
        }),

        builder.addCase(getFavoriteGames.fulfilled, (state, action) => {
            state.favoriteGames     = action.payload.data.result
        }),
        builder.addCase(getFavoriteGames.rejected, (state, action) => {
            state.alert             = action.payload?.message || ''
            state.variant           = action.payload?.variant || ''
        }),

        builder.addCase(getFavoriteGamesPopulated.fulfilled, (state, action) => {
            state.favoriteGamesData = action.payload.data.result
        }),
        builder.addCase(getFavoriteGamesPopulated.rejected, (state, action) => {
            state.alert             = action.payload?.message || ''
            state.variant           = action.payload?.variant || ''
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
      updateGameComments: (state, action) => {
        state.comments = action.payload.comments
      },
    },
})

export const { clearAlert, clearMailStatus, updateGameComments } = gameSlice.actions

export default gameSlice.reducer