import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    data: [],
    active: null,
    pagination: {},
    alert: {},
    isLoading: false
}

export const getCommunities = createAsyncThunk('community/getCommunities', async (params, thunkAPI) => {
    try { return await api.getCommunities(params) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const getCommunity = createAsyncThunk('community/getCommunity', async (slug, thunkAPI) => {
    try { return await api.getCommunityBySlug(slug) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const createCommunity = createAsyncThunk('community/createCommunity', async (formData, thunkAPI) => {
    try { return await api.createCommunity(formData) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const updateCommunity = createAsyncThunk('community/updateCommunity', async ({ id, ...formData }, thunkAPI) => {
    try { return await api.updateCommunity(id, formData) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const deleteCommunity = createAsyncThunk('community/deleteCommunity', async (id, thunkAPI) => {
    try { const r = await api.deleteCommunity(id); return { ...r, deletedId: id } }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const joinCommunity = createAsyncThunk('community/joinCommunity', async ({ id, inviteCode } = {}, thunkAPI) => {
    try { return await api.joinCommunity(id, inviteCode ? { inviteCode } : {}) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const joinCommunityByCode = createAsyncThunk('community/joinCommunityByCode', async (code, thunkAPI) => {
    try { return await api.joinCommunityByCode(code) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const regenerateInviteCode = createAsyncThunk('community/regenerateInviteCode', async (id, thunkAPI) => {
    try { return await api.regenerateInviteCode(id) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const leaveCommunity = createAsyncThunk('community/leaveCommunity', async (id, thunkAPI) => {
    try { return await api.leaveCommunity(id) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const addModerator = createAsyncThunk('community/addModerator', async ({ communityId, userId }, thunkAPI) => {
    try { return await api.addCommunityModerator(communityId, { userId }) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const removeModerator = createAsyncThunk('community/removeModerator', async ({ communityId, userId }, thunkAPI) => {
    try { return await api.removeCommunityModerator(communityId, userId) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const banUser = createAsyncThunk('community/banUser', async ({ communityId, ...formData }, thunkAPI) => {
    try { return await api.banFromCommunity(communityId, formData) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

export const unbanUser = createAsyncThunk('community/unbanUser', async ({ communityId, userId }, thunkAPI) => {
    try { return await api.unbanFromCommunity(communityId, userId) }
    catch (err) { return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Server error' } }) }
})

const communitySlice = createSlice({
    name: 'community',
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getCommunities.pending, s => { s.isLoading = true })
        .addCase(getCommunities.fulfilled, (s, a) => { s.data = a.payload.data.result; s.pagination = a.payload.data.pagination; s.isLoading = false })
        .addCase(getCommunities.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(getCommunity.pending, s => { s.isLoading = true })
        .addCase(getCommunity.fulfilled, (s, a) => { s.active = a.payload.data.result; s.isLoading = false })
        .addCase(getCommunity.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(createCommunity.fulfilled, (s, a) => { s.data.unshift(a.payload.data.result); s.alert = a.payload.data.alert; s.isLoading = false })
        .addCase(createCommunity.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(updateCommunity.fulfilled, (s, a) => {
            const u = a.payload.data.result
            s.data = s.data.map(c => c._id === u._id ? u : c)
            if (s.active?._id === u._id) s.active = u
            s.alert = a.payload.data.alert; s.isLoading = false
        })
        .addCase(updateCommunity.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(deleteCommunity.fulfilled, (s, a) => { s.data = s.data.filter(c => c._id !== a.payload.deletedId); s.alert = a.payload.data.alert; s.isLoading = false })
        .addCase(deleteCommunity.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(joinCommunity.fulfilled, (s, a) => {
            const u = a.payload.data.result; s.data = s.data.map(c => c._id === u._id ? u : c)
            if (s.active?._id === u._id) s.active = u; s.alert = a.payload.data.alert; s.isLoading = false
        })
        .addCase(joinCommunity.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(leaveCommunity.fulfilled, (s, a) => {
            const u = a.payload.data.result; s.data = s.data.map(c => c._id === u._id ? u : c)
            if (s.active?._id === u._id) s.active = u; s.alert = a.payload.data.alert; s.isLoading = false
        })
        .addCase(leaveCommunity.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(addModerator.fulfilled, (s, a) => {
            const u = a.payload.data.result; if (s.active?._id === u._id) s.active = u; s.alert = a.payload.data.alert
        })
        .addCase(removeModerator.fulfilled, (s, a) => {
            const u = a.payload.data.result; if (s.active?._id === u._id) s.active = u; s.alert = a.payload.data.alert
        })

        .addCase(joinCommunityByCode.fulfilled, (s, a) => {
            const u = a.payload.data.result; s.data = s.data.map(c => c._id === u._id ? u : c)
            if (s.active?._id === u._id) s.active = u; s.alert = a.payload.data.alert; s.isLoading = false
        })
        .addCase(joinCommunityByCode.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(regenerateInviteCode.fulfilled, (s, a) => {
            if (s.active) s.active._inviteCode = a.payload.data.result.inviteCode
            s.alert = a.payload.data.alert
        })
        .addCase(regenerateInviteCode.rejected, (s, a) => { s.alert = a.payload?.alert || {}; s.isLoading = false })

        .addCase(banUser.fulfilled, (s, a) => { const u = a.payload.data.result; if (s.active?._id === u._id) s.active = u; s.alert = a.payload.data.alert })
        .addCase(unbanUser.fulfilled, (s, a) => { s.alert = a.payload.data.alert })
    },
    reducers: {
        clearAlert: (s) => { s.alert = {} },
        clearActive: (s) => { s.active = null },
    }
})

export const { clearAlert, clearActive } = communitySlice.actions
export default communitySlice.reducer
