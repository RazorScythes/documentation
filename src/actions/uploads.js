import * as api from '../api'
import { createSlice } from '@reduxjs/toolkit'
import { requestAPI } from '../api/function'

const initialState = {
    error               : '',
    isLoading           : false,
    alert               : '',
    variant             : '',
    video               : {},
    game                : {},
    blog                : {}
}

export const getUserVideo                                           = await requestAPI('uploads/getUserVideo', api.getUserVideo)
export const getUserGame                                            = await requestAPI('uploads/getUserGame', api.getUserGame)
export const uploadVideo                                            = await requestAPI('uploads/uploadVideo', api.uploadVideo)
export const editVideo                                              = await requestAPI('uploads/editVideo', api.editVideo)
export const editGame                                               = await requestAPI('uploads/editGame', api.editGame)
export const editBlog                                               = await requestAPI('uploads/editBlog', api.editBlog)
export const removeVideo                                            = await requestAPI('uploads/removeVideo', api.removeVideo)
export const bulkRemoveVideo                                        = await requestAPI('uploads/bulkRemoveVideo', api.bulkRemoveVideo)
export const changePrivacyById                                      = await requestAPI('uploads/changePrivacyById', api.changePrivacyById)
export const changeStrictById                                       = await requestAPI('uploads/changeStrictById', api.changeStrictById)
export const changeGamePrivacyById                                  = await requestAPI('uploads/changeGamePrivacyById', api.changeGamePrivacyById)
export const changeGameStrictById                                   = await requestAPI('uploads/changeGameStrictById', api.changeGameStrictById)
export const changeDownloadById                                     = await requestAPI('uploads/changeDownloadById', api.changeDownloadById)
export const uploadGame                                             = await requestAPI('uploads/uploadGame', api.uploadGame)
export const removeGame                                             = await requestAPI('uploads/removeGame', api.removeGame)
export const bulkRemoveGame                                         = await requestAPI('uploads/bulkRemoveGame', api.bulkRemoveGame)
export const uploadBlog                                             = await requestAPI('uploads/uploadBlog', api.uploadBlog)
export const getUserBlog                                            = await requestAPI('uploads/getUserBlog', api.getUserBlog)
export const changeBlogPrivacyById                                  = await requestAPI('uploads/changeBlogPrivacyById', api.changeBlogPrivacyById)
export const changeBlogStrictById                                   = await requestAPI('uploads/changeBlogStrictById', api.changeBlogStrictById)
export const removeBlog                                             = await requestAPI('uploads/removeBlog', api.removeBlog)
export const bulkRemoveBlog                                         = await requestAPI('uploads/bulkRemoveBlog', api.bulkRemoveBlog)

export const uploadsSlice = createSlice({
    name: 'uploads',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getUserVideo.fulfilled, (state, action) => {
            state.video             = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getUserVideo.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(getUserGame.fulfilled, (state, action) => {
            state.game              = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getUserGame.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(getUserBlog.fulfilled, (state, action) => {
            state.blog              = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getUserBlog.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(changePrivacyById.fulfilled, (state, action) => {
            const filteredObjects = state.video.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.video             = filteredObjects
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(changePrivacyById.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(changeGamePrivacyById.fulfilled, (state, action) => {
            const filteredObjects = state.game.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.game              = filteredObjects
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(changeGamePrivacyById.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(changeStrictById.fulfilled, (state, action) => {
            const filteredObjects = state.video.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });
            state.video             = filteredObjects
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(changeStrictById.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(changeGameStrictById.fulfilled, (state, action) => {
            const filteredObjects = state.game.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });
            state.game              = filteredObjects
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(changeGameStrictById.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(changeDownloadById.fulfilled, (state, action) => {
            const filteredObjects = state.video.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.video             = filteredObjects
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(changeDownloadById.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(uploadVideo.fulfilled, (state, action) => {
            state.video             = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(uploadVideo.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(uploadGame.fulfilled, (state, action) => {
            state.game              = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(uploadGame.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(uploadBlog.fulfilled, (state, action) => {
            state.blog              = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(uploadBlog.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(editVideo.fulfilled, (state, action) => {
            state.video             = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(editVideo.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(editGame.fulfilled, (state, action) => {
            state.game              = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(editGame.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(editBlog.fulfilled, (state, action) => {
            state.blog              = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(editBlog.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(removeVideo.fulfilled, (state, action) => {
            state.video             = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(removeVideo.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(bulkRemoveVideo.fulfilled, (state, action) => {
            state.video             = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(bulkRemoveVideo.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(removeGame.fulfilled, (state, action) => {
            state.game              = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(removeGame.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(bulkRemoveGame.fulfilled, (state, action) => {
            state.game              = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(bulkRemoveGame.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(changeBlogPrivacyById.fulfilled, (state, action) => {
            const filteredObjects = state.blog.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });

            state.blog              = filteredObjects
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(changeBlogPrivacyById.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(changeBlogStrictById.fulfilled, (state, action) => {
            const filteredObjects = state.blog.map(obj => {
                if (obj._id === action.payload.data.result._id) {return action.payload.data.result;}
                return obj;
            });
            state.blog              = filteredObjects
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(changeBlogStrictById.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(removeBlog.fulfilled, (state, action) => {
            state.blog              = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(removeBlog.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(bulkRemoveBlog.fulfilled, (state, action) => {
            state.blog              = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(bulkRemoveBlog.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        })
    },
    reducers: {
      clearAlert: (state) => {
        state.alert             = '',
        state.variant           = ''
      },
      clearMailStatus: (state) => {
        state.mailStatus        = ''
      },
    },
})

export const { clearAlert, clearMailStatus } = uploadsSlice.actions

export default uploadsSlice.reducer