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
    videos              : [],
    comments            : [],
    relatedVideos       : [],
    avatar              : '',
    message             : 'none',
    forbiden            : '',
    sideAlert           : {},
    tagsCount           : [],
    archiveList         : {},
    videoList           : [],
    archiveSaveLists    : [],
    groups              : {}
}

export const getVideos                  = await requestAPI('video/getVideos', api.getVideos)
export const getVideoByID               = await requestAPI('video/getVideoByID', api.getVideoByID)
export const getComments                = await requestAPI('video/getComments', api.getComments)
export const getRelatedVideos           = await requestAPI('video/getRelatedVideos', api.getRelatedVideos)
export const addOneViews                = await requestAPI('video/addOneViews', api.addOneViews)
export const addOneLikes                = await requestAPI('video/addOneLikes', api.addOneLikes)
export const addOneDislikes             = await requestAPI('video/addOneViews', api.addOneDislikes)
export const uploadComment              = await requestAPI('video/addOneViews', api.uploadComment)
export const removeComment              = await requestAPI('video/removeComment', api.removeComment)
export const getVideoByTag              = await requestAPI('video/getVideoByTag', api.getVideoByTag)
export const getVideoByArtist           = await requestAPI('video/getVideoByArtist', api.getVideoByArtist)
export const getVideoBySearchKey        = await requestAPI('video/getVideoBySearchKey', api.getVideoBySearchKey)
export const addToWatchLater            = await requestAPI('video/addToWatchLater', api.addToWatchLater)
export const uploadReport               = await requestAPI('video/uploadReport', api.uploadReport)
export const newGroupList               = await requestAPI('video/newGroupList', api.newGroupList)
export const removeGroup                = await requestAPI('video/removeGroup', api.removeGroup)
export const editGroupList              = await requestAPI('video/editGroupList', api.editGroupList)
export const countVideoTags             = await requestAPI('video/countVideoTags', api.countVideoTags)
export const uploadLists                = await requestAPI('video/uploadLists', api.uploadLists)
export const getGroupList               = await requestAPI('video/getGroupList', api.getGroupList)

export const videoSlice = createSlice({
    name: 'video',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getVideos.fulfilled, (state, action) => {
            state.videos            = action.payload.data.result
            state.archiveList       = action.payload.data.archiveList
            state.error             = ''
            state.isLoading         = false
            state.notFound          = false
        }),
        builder.addCase(getVideos.pending, (state, action) => {
            state.isLoading         = true
        }),
        builder.addCase(getVideos.rejected, (state, action) => {
            state.message           = action.payload.message
            state.notFound          = true;
            state.isLoading         = false
        }),

        builder.addCase(getVideoByTag.fulfilled, (state, action) => {
            state.tagsCount         = action.payload.data.tags
            state.videos            = action.payload.data.result
            state.archiveList       = action.payload.data.archiveList
            state.error             = ''
            state.isLoading         = false
            state.notFound          = false
        }),
        builder.addCase(getVideoByTag.pending, (state, action) => {
            state.isLoading         = true
        }),
        builder.addCase(getVideoByTag.rejected, (state, action) => {
            state.message           = action.payload.message
            state.notFound          = true;
            state.isLoading         = false
        }),

        builder.addCase(getVideoByArtist.fulfilled, (state, action) => {
            state.tagsCount         = action.payload.data.tags
            state.videos            = action.payload.data.result
            state.archiveList       = action.payload.data.archiveList
            state.error             = ''
            state.isLoading         = false
            state.notFound          = false
        }),
        builder.addCase(getVideoByArtist.pending, (state, action) => {
            state.isLoading         = true
        }),
        builder.addCase(getVideoByArtist.rejected, (state, action) => {
            state.message           = action.payload.message
            state.notFound          = true;
            state.isLoading         = false
        }),

        builder.addCase(getVideoBySearchKey.fulfilled, (state, action) => {
            state.tagsCount         = action.payload.data.tags
            state.videos            = action.payload.data.result
            state.archiveList       = action.payload.data.archiveList
            state.error             = ''
            state.isLoading         = false
            state.notFound          = false
        }),
        builder.addCase(getVideoBySearchKey.pending, (state, action) => {
            state.isLoading         = true
        }),
        builder.addCase(getVideoBySearchKey.rejected, (state, action) => {
            state.message           = action.payload.message
            state.notFound          = true;
            state.isLoading         = false
        }),

        builder.addCase(getVideoByID.fulfilled, (state, action) => {
            state.archiveSaveLists  = action.payload.data.archiveSaveLists
            state.archiveList       = action.payload.data.archiveList
            state.notFound          = false
            state.data              = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getVideoByID.pending, (state, action) => {
            state.notFound          = false
            state.isLoading         = true
        }),
        builder.addCase(getVideoByID.rejected, (state, action) => {
            state.forbiden          = action.payload.forbiden
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
            state.notFound          = action.payload.notFound
            state.isLoading         = false
        }),

        builder.addCase(getComments.fulfilled, (state, action) => {
            state.comments          = action.payload.data.comments
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getComments.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(getRelatedVideos.fulfilled, (state, action) => {
            state.relatedVideos     = action.payload.data.relatedVideos
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getRelatedVideos.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(uploadComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.comments
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(uploadComment.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(removeComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.comments
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(removeComment.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(addToWatchLater.fulfilled, (state, action) => {
            state.archiveSaveLists  = action.payload.data.archiveSaveLists
            state.sideAlert         = action.payload.data.sideAlert
        }),
        builder.addCase(addToWatchLater.rejected, (state, action) => {
            state.sideAlert         = action.payload.sideAlert
        }),

        builder.addCase(countVideoTags.fulfilled, (state, action) => {
            state.tagsCount         = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(countVideoTags.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(uploadLists.fulfilled, (state, action) => {
            state.videoList         = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(uploadLists.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(uploadReport.fulfilled, (state, action) => {
            state.sideAlert         = action.payload.data.sideAlert
        }),
        builder.addCase(uploadReport.rejected, (state, action) => {
            state.sideAlert         = action.payload.sideAlert
        }),

        builder.addCase(newGroupList.fulfilled, (state, action) => {
            state.groups            = action.payload.data.result
            state.sideAlert         = action.payload.data.sideAlert
        }),
        builder.addCase(newGroupList.rejected, (state, action) => {
            state.sideAlert         = action.payload.sideAlert
        }),

        builder.addCase(editGroupList.fulfilled, (state, action) => {
            state.groups            = action.payload.data.result
            state.sideAlert         = action.payload.data.sideAlert
        }),
        builder.addCase(editGroupList.rejected, (state, action) => {
            state.sideAlert         = action.payload.sideAlert
        }),

        builder.addCase(removeGroup.fulfilled, (state, action) => {
            state.groups            = action.payload.data.result
            state.sideAlert         = action.payload.data.sideAlert
        }),
        builder.addCase(removeGroup.rejected, (state, action) => {
            state.sideAlert         = action.payload.sideAlert
        }),

        builder.addCase(getGroupList.fulfilled, (state, action) => {
            state.groups            = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getGroupList.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert         = '',
            state.variant       = ''
            state.sideAlert     = {}
        },
        clearMailStatus: (state) => {
            state.mailStatus    = ''
        },
    },
})

export const { clearAlert, clearMailStatus } = videoSlice.actions

export default videoSlice.reducer