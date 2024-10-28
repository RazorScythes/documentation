import * as api from '../api'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
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

export const getProjectByID = createAsyncThunk('project/getProjectByID', async (form, thunkAPI) => {
    try {
        const response = await api.getProjectByID(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const uploadProject = createAsyncThunk('project/uploadProject', async (form, thunkAPI) => {
    try {
        const response = await api.uploadProject(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const getCategory = createAsyncThunk('project/getCategory', async (form, thunkAPI) => {
    try {
        const response = await api.getCategory(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const getUserProject = createAsyncThunk('project/getUserProject', async (form, thunkAPI) => {
    try {
        const response = await api.getUserProject(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const getAdminCategory = createAsyncThunk('project/getAdminCategory', async (form, thunkAPI) => {
    try {
        const response = await api.getAdminCategory(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const getProjects = createAsyncThunk('project/getProjects', async (form, thunkAPI) => {
    try {
        const response = await api.getProjects(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const getProjectsByCategories = createAsyncThunk('project/getProjectsByCategories', async (form, thunkAPI) => {
    try {
        const response = await api.getProjectsByCategories(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const getProjectsBySearchKey = createAsyncThunk('project/getProjectsBySearchKey', async (form, thunkAPI) => {
    try {
        const response = await api.getProjectsBySearchKey(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const editUserProject = createAsyncThunk('project/editUserProject', async (form, thunkAPI) => {
    try {
        const response = await api.editUserProject(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const removeUserProject = createAsyncThunk('project/removeUserProject', async (form, thunkAPI) => {
    try {
        const response = await api.removeUserProject(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const projectCountTags = createAsyncThunk('project/projectCountTags', async (form, thunkAPI) => {
    try {
        const response = await api.projectCountTags(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const getProjectComments = createAsyncThunk('project/getProjectComments', async (form, thunkAPI) => {
    try {
        const response = await api.getProjectComments(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const uploadProjectComment = createAsyncThunk('project/uploadProjectComment', async (form, thunkAPI) => {
    try {
        const response = await api.uploadProjectComment(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const removeProjectComment = createAsyncThunk('project/removeProjectComment', async (form, thunkAPI) => {
    try {
        const response = await api.removeProjectComment(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});

export const getLatestProjects = createAsyncThunk('project/getLatestProjects', async (form, thunkAPI) => {
    try {
        const response = await api.getLatestProjects(form);
        return response;
    } catch (err) {
        if (err.response && err.response.data) return thunkAPI.rejectWithValue(err.response.data);
        return { variant: 'danger', message: "409: there was a problem with the server." };
    }
});


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