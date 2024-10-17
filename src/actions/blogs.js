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

export const getBlogByID                        = await requestAPI('blog/getBlogByID', api.getBlogByID)
export const getBlogs                           = await requestAPI('blog/getBlogs', api.getBlogs)
export const getBlogComments                    = await requestAPI('blog/getBlogComments', api.getBlogComments)
export const uploadBlogComment                  = await requestAPI('blog/uploadBlogComment', api.uploadBlogComment)
export const removeBlogComment                  = await requestAPI('blog/removeBlogComment', api.removeBlogComment)
export const addOneBlogViews                    = await requestAPI('blog/addOneBlogViews', api.addOneBlogViews)
export const countBlogCategories                = await requestAPI('blog/countBlogCategories', api.countBlogCategories)
export const addOneBlogLikes                    = await requestAPI('blog/addOneBlogLikes', api.addOneBlogLikes)
export const addLatestBlogLikes                 = await requestAPI('blog/addLatestBlogLikes', api.addLatestBlogLikes)
export const getLatestBlogs                     = await requestAPI('blog/getLatestBlogs', api.getLatestBlogs)
export const getBlogsBySearchKey                = await requestAPI('blog/getBlogsBySearchKey', api.getBlogsBySearchKey)
export const countBlogCategoriesBySearchKey     = await requestAPI('blog/countBlogCategoriesBySearchKey', api.countBlogCategoriesBySearchKey)
export const addOneBlogLikesBySearchKey         = await requestAPI('blog/addOneBlogLikesBySearchKey', api.addOneBlogLikesBySearchKey)
export const blogsCountTags                     = await requestAPI('blog/blogsCountTags', api.blogsCountTags)

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