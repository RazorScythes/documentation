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

export const getVideos = createAsyncThunk('video/getVideos', async (form, thunkAPI) => {
    try {
        const response = await api.getVideos(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const getVideoByID = createAsyncThunk('video/getVideoByID', async (form, thunkAPI) => {
    try {
        const response = await api.getVideoByID(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const getComments = createAsyncThunk('video/getComments', async (form, thunkAPI) => {
    try {
        const response = await api.getComments(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const getRelatedVideos = createAsyncThunk('video/getRelatedVideos', async (form, thunkAPI) => {
    try {
        const response = await api.getRelatedVideos(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const addOneViews = createAsyncThunk('video/addOneViews', async (form, thunkAPI) => {
    try {
        const response = await api.addOneViews(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const addOneLikes = createAsyncThunk('video/addOneLikes', async (form, thunkAPI) => {
    try {
        const response = await api.addOneLikes(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const addOneDislikes = createAsyncThunk('video/addOneDislikes', async (form, thunkAPI) => {
    try {
        const response = await api.addOneDislikes(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const uploadComment = createAsyncThunk('video/uploadComment', async (form, thunkAPI) => {
    try {
        const response = await api.uploadComment(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const removeComment = createAsyncThunk('video/removeComment', async (form, thunkAPI) => {
    try {
        const response = await api.removeComment(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const getVideoByTag = createAsyncThunk('video/getVideoByTag', async (form, thunkAPI) => {
    try {
        const response = await api.getVideoByTag(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const getVideoByArtist = createAsyncThunk('video/getVideoByArtist', async (form, thunkAPI) => {
    try {
        const response = await api.getVideoByArtist(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const getVideoBySearchKey = createAsyncThunk('video/getVideoBySearchKey', async (form, thunkAPI) => {
    try {
        const response = await api.getVideoBySearchKey(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const addToWatchLater = createAsyncThunk('video/addToWatchLater', async (form, thunkAPI) => {
    try {
        const response = await api.addToWatchLater(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const uploadReport = createAsyncThunk('video/uploadReport', async (form, thunkAPI) => {
    try {
        const response = await api.uploadReport(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const newGroupList = createAsyncThunk('video/newGroupList', async (form, thunkAPI) => {
    try {
        const response = await api.newGroupList(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const removeGroup = createAsyncThunk('video/removeGroup', async (form, thunkAPI) => {
    try {
        const response = await api.removeGroup(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const editGroupList = createAsyncThunk('video/editGroupList', async (form, thunkAPI) => {
    try {
        const response = await api.editGroupList(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const countVideoTags = createAsyncThunk('video/countVideoTags', async (form, thunkAPI) => {
    try {
        const response = await api.countVideoTags(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const uploadLists = createAsyncThunk('video/uploadLists', async (form, thunkAPI) => {
    try {
        const response = await api.uploadLists(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

export const getGroupList = createAsyncThunk('video/getGroupList', async (form, thunkAPI) => {
    try {
        const response = await api.getGroupList(form);
        return response;
    } catch (err) {
        return handleApiError(err, thunkAPI);
    }
});

// Helper function to handle errors
const handleApiError = (err, thunkAPI) => {
    if (err.response && err.response.data) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
    return { variant: 'danger', message: "409: there was a problem with the server." };
};


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