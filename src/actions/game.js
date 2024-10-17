import * as api from '../api'
import { createSlice } from '@reduxjs/toolkit'
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

export const getGameByID                                = await requestAPI('game/getGameByID', api.getGameByID)
export const getGames                                   = await requestAPI('game/getGames', api.getGames)
export const getRelatedGames                            = await requestAPI('game/getRelatedGames', api.getRelatedGames)
export const addRatings                                 = await requestAPI('game/addRatings', api.addRatings)
export const addRatingsRelated                          = await requestAPI('game/addRatingsRelated', api.addRatings)
export const addOneDownload                             = await requestAPI('game/addOneDownload', api.addOneDownload)
export const updateGameAccessKey                        = await requestAPI('game/updateGameAccessKey', api.updateGameAccessKey)
export const countTags                                  = await requestAPI('game/countTags', api.countTags)
export const categoriesCount                            = await requestAPI('game/categoriesCount', api.categoriesCount)
export const getGameByTag                               = await requestAPI('game/getGameByTag', api.getGameByTag)
export const getGameByDeveloper                         = await requestAPI('game/getGameByDeveloper', api.getGameByDeveloper)
export const getGameBySearchKey                         = await requestAPI('game/getGameBySearchKey', api.getGameBySearchKey)
export const getRecentGameBlog                          = await requestAPI('game/getRecentGameBlog', api.getRecentGameBlog)
export const addRecentGamingBlogLikes                   = await requestAPI('game/addRecentGamingBlogLikes', api.addRecentGamingBlogLikes)
export const getGameComments                            = await requestAPI('game/getGameComments', api.getGameComments)
export const uploadGameComment                          = await requestAPI('game/uploadGameComment', api.uploadGameComment)
export const removeGameComment                          = await requestAPI('game/removeGameComment', api.removeGameComment)

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