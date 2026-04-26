import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    feed: [],
    posts: [],
    activePost: null,
    comments: [],
    searchResults: [],
    tags: [],
    pagination: {},
    commentPagination: {},
    searchPagination: {},
    alert: {},
    isLoading: false,
    commentLoading: false,
}

export const getFeed = createAsyncThunk('forum/getFeed', async (params, thunkAPI) => {
    try { return await api.getForumFeed(params) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const getPosts = createAsyncThunk('forum/getPosts', async (params, thunkAPI) => {
    try { return await api.getForumPosts(params) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const getPost = createAsyncThunk('forum/getPost', async (id, thunkAPI) => {
    try { return await api.getForumPost(id) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const createPost = createAsyncThunk('forum/createPost', async (formData, thunkAPI) => {
    try { return await api.createForumPost(formData) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const updatePost = createAsyncThunk('forum/updatePost', async ({ id, ...formData }, thunkAPI) => {
    try { return await api.updateForumPost(id, formData) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const deletePost = createAsyncThunk('forum/deletePost', async (id, thunkAPI) => {
    try { const r = await api.deleteForumPost(id); return { ...r, deletedId: id } }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const togglePostPin = createAsyncThunk('forum/togglePostPin', async (id, thunkAPI) => {
    try { return { ...(await api.toggleForumPostPin(id)), postId: id } }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const togglePostLock = createAsyncThunk('forum/togglePostLock', async (id, thunkAPI) => {
    try { return { ...(await api.toggleForumPostLock(id)), postId: id } }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const votePost = createAsyncThunk('forum/votePost', async ({ id, value }, thunkAPI) => {
    try { return { ...(await api.voteForumPost(id, { value })), postId: id } }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const getComments = createAsyncThunk('forum/getComments', async ({ postId, ...params }, thunkAPI) => {
    try { return await api.getForumComments(postId, params) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const createComment = createAsyncThunk('forum/createComment', async ({ postId, ...formData }, thunkAPI) => {
    try { return await api.createForumComment(postId, formData) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const updateComment = createAsyncThunk('forum/updateComment', async ({ id, ...formData }, thunkAPI) => {
    try { return await api.updateForumComment(id, formData) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const deleteComment = createAsyncThunk('forum/deleteComment', async (id, thunkAPI) => {
    try { const r = await api.deleteForumComment(id); return { ...r, deletedId: id } }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const voteComment = createAsyncThunk('forum/voteComment', async ({ id, value }, thunkAPI) => {
    try { return await api.voteForumComment(id, { value }) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const getForumTags = createAsyncThunk('forum/getForumTags', async (_, thunkAPI) => {
    try { return await api.getForumTags() }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const searchForum = createAsyncThunk('forum/searchForum', async (params, thunkAPI) => {
    try { return await api.searchForum(params) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

const forumSlice = createSlice({
    name: 'forum',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getFeed.pending, s => { s.isLoading = true })
        .addCase(getFeed.fulfilled, (s, a) => { s.feed = a.payload.data.result; s.pagination = a.payload.data.pagination; s.isLoading = false })
        .addCase(getFeed.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(getPosts.pending, s => { s.isLoading = true })
        .addCase(getPosts.fulfilled, (s, a) => { s.posts = a.payload.data.result; s.pagination = a.payload.data.pagination; s.isLoading = false })
        .addCase(getPosts.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(getPost.pending, s => { s.isLoading = true })
        .addCase(getPost.fulfilled, (s, a) => { s.activePost = a.payload.data.result; s.isLoading = false })
        .addCase(getPost.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(createPost.fulfilled, (s, a) => { s.posts.unshift(a.payload.data.result); s.feed.unshift(a.payload.data.result); s.alert = a.payload.data.alert; s.isLoading = false })
        .addCase(createPost.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(updatePost.fulfilled, (s, a) => {
            const u = a.payload.data.result
            s.posts = s.posts.map(p => p._id === u._id ? u : p)
            s.feed = s.feed.map(p => p._id === u._id ? u : p)
            if (s.activePost?._id === u._id) s.activePost = u
            s.alert = a.payload.data.alert; s.isLoading = false
        })
        .addCase(updatePost.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(deletePost.fulfilled, (s, a) => {
            const id = a.payload.deletedId
            s.posts = s.posts.filter(p => p._id !== id)
            s.feed = s.feed.filter(p => p._id !== id)
            s.alert = a.payload.data.alert; s.isLoading = false
        })
        .addCase(deletePost.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(togglePostPin.fulfilled, (s, a) => {
            const u = a.payload.data?.result
            if (u?._id) {
                const up = p => p._id === u._id ? { ...p, ...u } : p
                s.posts = s.posts.map(up)
                s.feed = s.feed.map(up)
                if (s.activePost?._id === u._id) s.activePost = { ...s.activePost, ...u }
            }
        })
        .addCase(togglePostLock.fulfilled, (s, a) => {
            const u = a.payload.data?.result
            if (u?._id) {
                const up = p => p._id === u._id ? { ...p, ...u } : p
                s.posts = s.posts.map(up)
                s.feed = s.feed.map(up)
                if (s.activePost?._id === u._id) s.activePost = { ...s.activePost, ...u }
            }
        })

        .addCase(votePost.fulfilled, (s, a) => {
            const { postId } = a.payload
            const v = a.payload.data.result
            const update = p => p._id === postId ? { ...p, score: v.score, upvotes: v.upvotes, downvotes: v.downvotes } : p
            s.posts = s.posts.map(update)
            s.feed = s.feed.map(update)
            if (s.activePost?._id === postId) { s.activePost.score = v.score; s.activePost.upvotes = v.upvotes; s.activePost.downvotes = v.downvotes }
        })

        .addCase(getComments.pending, s => { s.commentLoading = true })
        .addCase(getComments.fulfilled, (s, a) => { s.comments = a.payload.data.result; s.commentPagination = a.payload.data.pagination; s.commentLoading = false })
        .addCase(getComments.rejected, (s, a) => { s.commentLoading = false })

        .addCase(createComment.fulfilled, (s, a) => { s.comments.unshift(a.payload.data.result); s.alert = a.payload.data.alert })
        .addCase(createComment.rejected, (s, a) => { s.alert = a.payload?.alert || {} })

        .addCase(updateComment.fulfilled, (s, a) => { const u = a.payload.data.result; s.comments = s.comments.map(c => c._id === u._id ? u : c); s.alert = a.payload.data.alert })
        .addCase(deleteComment.fulfilled, (s, a) => { s.comments = s.comments.filter(c => c._id !== a.payload.deletedId); s.alert = a.payload.data.alert })

        .addCase(voteComment.fulfilled, (s, a) => {
            const v = a.payload.data.result
            s.comments = s.comments.map(c => c._id === v.commentId ? { ...c, score: v.score, upvotes: v.upvotes, downvotes: v.downvotes } : c)
        })

        .addCase(getForumTags.fulfilled, (s, a) => { s.tags = a.payload.data.result })

        .addCase(searchForum.pending, s => { s.isLoading = true })
        .addCase(searchForum.fulfilled, (s, a) => { s.searchResults = a.payload.data.result; s.searchPagination = a.payload.data.pagination; s.isLoading = false })
        .addCase(searchForum.rejected, (s, a) => { s.isLoading = false })
    },
    reducers: {
        clearAlert: (s) => { s.alert = {} },
        clearActivePost: (s) => { s.activePost = null },
        clearComments: (s) => { s.comments = [] },
        addRealtimePost: (s, a) => { s.feed.unshift(a.payload); s.posts.unshift(a.payload) },
        updateRealtimeVotes: (s, a) => {
            const { postId, score, upvotes, downvotes } = a.payload
            const update = p => p._id === postId ? { ...p, score, upvotes, downvotes } : p
            s.posts = s.posts.map(update)
            s.feed = s.feed.map(update)
            if (s.activePost?._id === postId) { s.activePost.score = score; s.activePost.upvotes = upvotes; s.activePost.downvotes = downvotes }
        },
        addRealtimeComment: (s, a) => { s.comments.push(a.payload) },
    }
})

export const { clearAlert, clearActivePost, clearComments, addRealtimePost, updateRealtimeVotes, addRealtimeComment } = forumSlice.actions
export default forumSlice.reducer
