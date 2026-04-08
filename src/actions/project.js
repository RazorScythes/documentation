import * as api from '../api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

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
    notFound            : false,
    categories          : [],
    latestProjects      : [],
    sideAlert           : {},
}

const rejectErr = (thunkAPI, err) => {
    if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
    return thunkAPI.rejectWithValue({ variant: 'danger', message: 'There was a problem with the server.' })
}

export const getProjectByID = createAsyncThunk('project/getProjectByID', async (form, thunkAPI) => {
    try { return await api.getProjectByID(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const uploadProject = createAsyncThunk('project/uploadProject', async (form, thunkAPI) => {
    try { return await api.uploadProject(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getCategory = createAsyncThunk('project/getCategory', async (form, thunkAPI) => {
    try { return await api.getCategory(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getUserProject = createAsyncThunk('project/getUserProject', async (form, thunkAPI) => {
    try { return await api.getUserProject(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getAdminCategory = createAsyncThunk('project/getAdminCategory', async (form, thunkAPI) => {
    try { return await api.getAdminCategory(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const addProjectCategory = createAsyncThunk('project/addProjectCategory', async (form, thunkAPI) => {
    try { return await api.addProjectCategory(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const editProjectCategory = createAsyncThunk('project/editProjectCategory', async (form, thunkAPI) => {
    try { return await api.editProjectCategory(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const removeProjectCategory = createAsyncThunk('project/removeProjectCategory', async (form, thunkAPI) => {
    try { return await api.removeProjectCategory(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getProjects = createAsyncThunk('project/getProjects', async (form, thunkAPI) => {
    try { return await api.getProjects(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getProjectsByCategories = createAsyncThunk('project/getProjectsByCategories', async (form, thunkAPI) => {
    try { return await api.getProjectsByCategories(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getProjectsBySearchKey = createAsyncThunk('project/getProjectsBySearchKey', async (form, thunkAPI) => {
    try { return await api.getProjectsBySearchKey(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const editUserProject = createAsyncThunk('project/editUserProject', async (form, thunkAPI) => {
    try { return await api.editUserProject(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const removeUserProject = createAsyncThunk('project/removeUserProject', async (form, thunkAPI) => {
    try { return await api.removeUserProject(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const projectCountTags = createAsyncThunk('project/projectCountTags', async (form, thunkAPI) => {
    try { return await api.projectCountTags(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getProjectComments = createAsyncThunk('project/getProjectComments', async (form, thunkAPI) => {
    try { return await api.getProjectComments(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const addProjectComment = createAsyncThunk('project/addProjectComment', async (form, thunkAPI) => {
    try { return await api.uploadProjectComment(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const updateProjectComment = createAsyncThunk('project/updateProjectComment', async (form, thunkAPI) => {
    try { return await api.updateProjectComment(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const deleteProjectComment = createAsyncThunk('project/deleteProjectComment', async (data, thunkAPI) => {
    try {
        const { id, project_id } = data;
        return await api.removeProjectComment(id, project_id);
    } catch (err) { return rejectErr(thunkAPI, err) }
});

export const toggleProjectLike = createAsyncThunk('project/toggleProjectLike', async (form, thunkAPI) => {
    try { return await api.toggleProjectLike(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const getLatestProjects = createAsyncThunk('project/getLatestProjects', async (form, thunkAPI) => {
    try { return await api.getLatestProjects(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});

export const viewProject = createAsyncThunk('project/viewProject', async (form, thunkAPI) => {
    try { return await api.viewProject(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
});


export const projectSlice = createSlice({
    name: 'project',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getProjectByID.fulfilled, (state, action) => {
            state.notFound          = false
            if (action.payload.data.forbiden) {
                state.forbiden      = action.payload.data.forbiden
                state.data          = {}
            } else {
                state.forbiden      = false
                state.data          = action.payload.data.result
            }
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getProjectByID.pending, (state, action) => {
            state.notFound          = false
            state.forbiden          = false
            state.isLoading         = true
        }),
        builder.addCase(getProjectByID.rejected, (state, action) => {
            state.forbiden          = action.payload?.forbiden
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
            state.notFound          = action.payload?.notFound
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

        builder.addCase(addProjectCategory.fulfilled, (state, action) => {
            state.category          = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
        }),
        builder.addCase(addProjectCategory.rejected, (state, action) => {
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
        }),

        builder.addCase(editProjectCategory.fulfilled, (state, action) => {
            state.category          = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
        }),
        builder.addCase(editProjectCategory.rejected, (state, action) => {
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
        }),

        builder.addCase(removeProjectCategory.fulfilled, (state, action) => {
            state.category          = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
        }),
        builder.addCase(removeProjectCategory.rejected, (state, action) => {
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
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
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
        }),

        builder.addCase(getUserProject.fulfilled, (state, action) => {
            state.project           = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(getUserProject.rejected, (state, action) => {
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
        }),

        builder.addCase(editUserProject.fulfilled, (state, action) => {
            state.project           = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(editUserProject.rejected, (state, action) => {
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
        }),

        builder.addCase(removeUserProject.fulfilled, (state, action) => {
            state.project           = action.payload.data.result
            state.alert             = action.payload.data.message
            state.variant           = action.payload.data.variant
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(removeUserProject.rejected, (state, action) => {
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
        }),

        builder.addCase(projectCountTags.fulfilled, (state, action) => {
            state.tagsCount         = action.payload.data.result
            state.error             = ''
            state.isLoading         = false
        }),
        builder.addCase(projectCountTags.rejected, (state, action) => {
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
        }),

        builder.addCase(getProjectComments.fulfilled, (state, action) => {
            state.comments          = action.payload.data.result
            state.error             = ''
        }),
        builder.addCase(getProjectComments.rejected, (state, action) => {
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
        }),

        builder.addCase(addProjectComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.result
            state.sideAlert         = action.payload.data.alert || {}
        }),
        builder.addCase(addProjectComment.rejected, (state, action) => {
            state.alert             = action.payload?.alert?.message || ''
        }),

        builder.addCase(updateProjectComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.result
        }),
        builder.addCase(updateProjectComment.rejected, (state, action) => {
            state.alert             = action.payload?.alert?.message || ''
        }),

        builder.addCase(deleteProjectComment.fulfilled, (state, action) => {
            state.comments          = action.payload.data.result
            state.sideAlert         = action.payload.data.alert || {}
        }),
        builder.addCase(deleteProjectComment.rejected, (state, action) => {
            state.alert             = action.payload?.alert?.message || ''
        }),

        builder.addCase(toggleProjectLike.fulfilled, (state, action) => {
            if (state.data) state.data.likes = action.payload.data.result
        }),
        builder.addCase(toggleProjectLike.rejected, (state, action) => {
            state.alert             = action.payload?.message
            state.variant           = action.payload?.variant
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
        }),
        builder.addCase(viewProject.fulfilled, (state, action) => {
            if (state.data && action.payload?.data?.result?.views) {
                state.data.views = action.payload.data.result.views
            }
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
      updateProjectComments: (state, action) => {
        state.comments = action.payload.comments
      },
    },
})

export const { clearAlert, clearMailStatus, updateProjectComments } = projectSlice.actions

export default projectSlice.reducer