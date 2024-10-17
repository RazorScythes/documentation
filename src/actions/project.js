import * as api from '../api'
import { createSlice } from '@reduxjs/toolkit'
import { requestAPI } from '../api/function'

const initialState = {
    error               : '',
    isLoading           : false,
    category_loading    : false,
    alert               : '',
    variant             : '',
    paragraph           : '',
    project             : {},
    comments            : [],
    user_project        : [],
    category            : [],
    user_category       : [],
    tagsCount           : [],
    data                : {},
    forbiden            : '',
    categories          : [],
    latestProjects      : []
}

export const getProjectByID                                     = await requestAPI('project/getProjectByID', api.getProjectByID)
export const uploadProject                                      = await requestAPI('project/uploadProject', api.uploadProject)
export const getCategory                                        = await requestAPI('project/getCategory', api.getCategory)
export const getUserProject                                     = await requestAPI('project/getUserProject', api.getUserProject)
export const getAdminCategory                                   = await requestAPI('project/getAdminCategory', api.getAdminCategory)
export const getProjects                                        = await requestAPI('project/getProjects', api.getProjects)
export const getProjectsByCategories                            = await requestAPI('project/getProjectsByCategories', api.getProjectsByCategories)
export const getProjectsBySearchKey                             = await requestAPI('project/getProjectsBySearchKey', api.getProjectsBySearchKey)
export const editUserProject                                    = await requestAPI('project/editUserProject', api.editUserProject)
export const removeUserProject                                  = await requestAPI('project/removeUserProject', api.removeUserProject)
export const projectCountTags                                   = await requestAPI('project/projectCountTags', api.projectCountTags)
export const getProjectComments                                 = await requestAPI('project/getProjectComments', api.getProjectComments)
export const uploadProjectComment                               = await requestAPI('project/uploadProjectComment', api.uploadProjectComment)
export const removeProjectComment                               = await requestAPI('project/removeProjectComment', api.removeProjectComment)
export const getLatestProjects                                  = await requestAPI('project/getLatestProjects', api.getLatestProjects)

export const projectSlice = createSlice({
    name: 'project',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getProjectByID.fulfilled, (state, action) => {
            state.notFound          = false
            state.data              = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getProjectByID.pending, (state, action) => {
            state.notFound          = false
            state.isLoading         = true
        }),
        builder.addCase(getProjectByID.rejected, (state, action) => {
            state.forbiden          = action.payload.forbiden
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
            state.notFound          = action.payload.notFound
            state.isLoading         = false
        }),
        
        builder.addCase(getCategory.fulfilled, (state, action) => {
            state.notFound          = false
            state.user_category     = action.payload.data.result
            state.error             = ''
            state.category_loading  = false
        }),
        builder.addCase(getCategory.pending, (state, action) => {
            state.notFound          = false
            state.category_loading  = true
        }),

        builder.addCase(getAdminCategory.fulfilled, (state, action) => {
            state.notFound          = false
            state.category          = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getAdminCategory.pending, (state, action) => {
            state.notFound          = false
            state.isLoading         = true
        }),

        builder.addCase(getProjects.fulfilled, (state, action) => {
            state.notFound          = false
            state.user_project      = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getProjects.pending, (state, action) => {
            state.notFound          = false
            state.isLoading         = true
        }),

        builder.addCase(getProjectsByCategories.fulfilled, (state, action) => {
            state.notFound          = false
            state.user_project      = action.payload.data.result
            state.tagsCount         = action.payload.data.tags
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getProjectsByCategories.pending, (state, action) => {
            state.notFound          = false
            state.isLoading         = true
        }),
        builder.addCase(getProjectsByCategories.rejected, (state, action) => {
            state.notFound          = true
            state.isLoading         = false
        }),

        builder.addCase(getProjectsBySearchKey.fulfilled, (state, action) => {
            state.notFound          = false
            state.user_project      = action.payload.data.result
            state.tagsCount         = action.payload.data.tags
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getProjectsBySearchKey.pending, (state, action) => {
            state.notFound          = false
            state.isLoading         = true
        }),
        builder.addCase(getProjectsBySearchKey.rejected, (state, action) => {
            state.notFound          = true
            state.isLoading         = false
        }),

        builder.addCase(uploadProject.fulfilled, (state, action) => {
            state.project           = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(uploadProject.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(getUserProject.fulfilled, (state, action) => {
            state.project           = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getUserProject.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(editUserProject.fulfilled, (state, action) => {
            state.project           = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(editUserProject.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(removeUserProject.fulfilled, (state, action) => {
            state.project           = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(removeUserProject.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(projectCountTags.fulfilled, (state, action) => {
            state.tagsCount         = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(projectCountTags.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(getProjectComments.fulfilled, (state, action) => {
            state.comments          = action.payload.data.comments
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getProjectComments.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(removeProjectComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.comments
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(removeProjectComment.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(uploadProjectComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.comments
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(uploadProjectComment.rejected, (state, action) => {
            state.alert             = action.payload.message
            state.variant           = action.payload.variant
        }),

        builder.addCase(getLatestProjects.fulfilled, (state, action) => {
            state.notFound          = false
            state.latestProjects    = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getLatestProjects.pending, (state, action) => {
            state.notFound          = false
            state.isLoading         = true
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

export const { clearAlert, clearMailStatus } = projectSlice.actions

export default projectSlice.reducer