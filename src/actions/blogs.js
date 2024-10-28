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
    blogs               : [],
    comments            : [],
    relatedBlogs        : [],
    avatar              : '',
    message             : '',
    forbiden            : '',
    sideAlert           : {},
    tagsCount           : [],
    categories          : [],
    latestBlogs         : []
}

export const getBlogByID = createAsyncThunk('blog/getBlogByID', async (form, thunkAPI) => {
    try {
        const response = await api.getBlogByID(form);
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

export const getBlogs = createAsyncThunk('blog/getBlogs', async (form, thunkAPI) => {
    try {
        const response = await api.getBlogs(form);
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

export const getBlogComments = createAsyncThunk('blog/getBlogComments', async (form, thunkAPI) => {
    try {
        const response = await api.getBlogComments(form);
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

export const uploadBlogComment = createAsyncThunk('blog/uploadBlogComment', async (form, thunkAPI) => {
    try {
        const response = await api.uploadBlogComment(form);
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

export const removeBlogComment = createAsyncThunk('blog/removeBlogComment', async (form, thunkAPI) => {
    try {
        const response = await api.removeBlogComment(form);
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

export const addOneBlogViews = createAsyncThunk('blog/addOneBlogViews', async (form, thunkAPI) => {
    try {
        const response = await api.addOneBlogViews(form);
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

export const countBlogCategories = createAsyncThunk('blog/countBlogCategories', async (form, thunkAPI) => {
    try {
        const response = await api.countBlogCategories(form);
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

export const addOneBlogLikes = createAsyncThunk('blog/addOneBlogLikes', async (form, thunkAPI) => {
    try {
        const response = await api.addOneBlogLikes(form);
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

export const addLatestBlogLikes = createAsyncThunk('blog/addLatestBlogLikes', async (form, thunkAPI) => {
    try {
        const response = await api.addLatestBlogLikes(form);
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

export const getLatestBlogs = createAsyncThunk('blog/getLatestBlogs', async (form, thunkAPI) => {
    try {
        const response = await api.getLatestBlogs(form);
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

export const getBlogsBySearchKey = createAsyncThunk('blog/getBlogsBySearchKey', async (form, thunkAPI) => {
    try {
        const response = await api.getBlogsBySearchKey(form);
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

export const countBlogCategoriesBySearchKey = createAsyncThunk('blog/countBlogCategoriesBySearchKey', async (form, thunkAPI) => {
    try {
        const response = await api.countBlogCategoriesBySearchKey(form);
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

export const addOneBlogLikesBySearchKey = createAsyncThunk('blog/addOneBlogLikesBySearchKey', async (form, thunkAPI) => {
    try {
        const response = await api.addOneBlogLikesBySearchKey(form);
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

export const blogsCountTags = createAsyncThunk('blog/blogsCountTags', async (form, thunkAPI) => {
    try {
        const response = await api.blogsCountTags(form);
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


export const blogsSlice = createSlice({
    name: 'blogs',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(getBlogByID.fulfilled, (state, action) => {
            state.notFound      = false
            state.data          = action.payload.data.result
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(getBlogByID.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),
        builder.addCase(getBlogByID.rejected, (state, action) => {
            state.forbiden      = action.payload.forbiden
            state.alert         = action.payload.message
            state.variant       = action.payload.variant
            state.notFound      = action.payload.notFound
            state.isLoading     = false
        }),

        builder.addCase(getBlogComments.fulfilled, (state, action) => {
            state.comments      = action.payload.data.comments
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(getBlogComments.rejected, (state, action) => {
            state.alert         = action.payload.message
            state.variant       = action.payload.variant
        }),

        builder.addCase(removeBlogComment.fulfilled, (state, action) => {
            state.comments      = action.payload.data.comments
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(removeBlogComment.rejected, (state, action) => {
            state.alert         = action.payload.message
            state.variant       = action.payload.variant
        }),

        builder.addCase(uploadBlogComment.fulfilled, (state, action) => {
            state.comments      = action.payload.data.comments
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(uploadBlogComment.rejected, (state, action) => {
            state.alert         = action.payload.message
            state.variant       = action.payload.variant
        }),

        
        builder.addCase(getBlogs.fulfilled, (state, action) => {
            state.notFound      = false
            state.blogs         = action.payload.data.result
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(getBlogs.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),

        builder.addCase(getLatestBlogs.fulfilled, (state, action) => {
            state.notFound      = false
            state.latestBlogs   = action.payload.data.result
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(getLatestBlogs.pending, (state, action) => {
            state.notFound      = false
            state.isLoading     = true
        }),

        builder.addCase(countBlogCategories.fulfilled, (state, action) => {
            state.categories    = action.payload.data.result
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(countBlogCategories.rejected, (state, action) => {
            state.alert         = action.payload.message
            state.variant       = action.payload.variant
        }),

        builder.addCase(countBlogCategoriesBySearchKey.fulfilled, (state, action) => {
            state.categories    = action.payload.data.result
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(countBlogCategoriesBySearchKey.rejected, (state, action) => {
            state.alert         = action.payload.message
            state.variant       = action.payload.variant
        }),

        builder.addCase(addOneBlogLikes.fulfilled, (state, action) => {
            state.notFound      = false
            state.blogs         = action.payload.data.result
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(addOneBlogLikes.pending, (state, action) => {
            state.notFound      = false
            // state.isLoading = true
        }),

        builder.addCase(addOneBlogLikesBySearchKey.fulfilled, (state, action) => {
            state.notFound      = false
            state.blogs         = action.payload.data.result
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(addOneBlogLikesBySearchKey.pending, (state, action) => {
            state.notFound      = false
            // state.isLoading = true
        }),

        builder.addCase(addLatestBlogLikes.fulfilled, (state, action) => {
            state.notFound      = false
            state.latestBlogs   = action.payload.data.result
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(addLatestBlogLikes.pending, (state, action) => {
            state.notFound      = false
        }),

        builder.addCase(getBlogsBySearchKey.fulfilled, (state, action) => {
            state.blogs         = action.payload.data.result
            state.tagsCount     = action.payload.data.tags
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(getBlogsBySearchKey.rejected, (state, action) => {
            state.isLoading     = false
        }),
        builder.addCase(getBlogsBySearchKey.pending, (state, action) => {
            state.isLoading     = true
        }),

        builder.addCase(blogsCountTags.fulfilled, (state, action) => {
            state.tagsCount     = action.payload.data.result
            state.error         = ''
            state.isLoading     = false
        }),
        builder.addCase(blogsCountTags.rejected, (state, action) => {
            state.alert         = action.payload.message
            state.variant       = action.payload.variant
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

export const { clearAlert, clearMailStatus } = blogsSlice.actions

export default blogsSlice.reducer