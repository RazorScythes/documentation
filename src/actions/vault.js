import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    isLoading: false,
    alert: '',
    variant: '',
    entries: [],
    folders: [],
    stats: null,
    auditLogs: [],
    auditTotal: 0,
    devices: [],
    sharedWithMe: [],
    myShares: [],
    vaultStatus: null,
}

const rejectErr = (thunkAPI, err) => {
    if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
    return thunkAPI.rejectWithValue({ message: 'Network error', variant: 'danger' })
}

export const getVaultStatus = createAsyncThunk('vault/getStatus', async (_, thunkAPI) => {
    try { const { data } = await api.getVaultStatus(); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const setupVault = createAsyncThunk('vault/setup', async (payload, thunkAPI) => {
    try { const { data } = await api.setupVault(payload); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const unlockVault = createAsyncThunk('vault/unlock', async (payload, thunkAPI) => {
    try { const { data } = await api.unlockVault(payload); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const changeMasterPassword = createAsyncThunk('vault/changeMasterPassword', async (payload, thunkAPI) => {
    try { const { data } = await api.changeMasterPassword(payload); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const getEntries = createAsyncThunk('vault/getEntries', async (params = {}, thunkAPI) => {
    try { const { data } = await api.getVaultEntries(params); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const createEntry = createAsyncThunk('vault/createEntry', async (payload, thunkAPI) => {
    try { const { data } = await api.createVaultEntry(payload); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const updateEntry = createAsyncThunk('vault/updateEntry', async ({ id, ...payload }, thunkAPI) => {
    try { const { data } = await api.updateVaultEntry(id, payload); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const deleteEntry = createAsyncThunk('vault/deleteEntry', async ({ id, permanent }, thunkAPI) => {
    try { const { data } = await api.deleteVaultEntry(id, { permanent }); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const restoreEntry = createAsyncThunk('vault/restoreEntry', async ({ id }, thunkAPI) => {
    try { const { data } = await api.restoreVaultEntry(id); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const emptyTrash = createAsyncThunk('vault/emptyTrash', async (_, thunkAPI) => {
    try { const { data } = await api.emptyVaultTrash(); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const getFolders = createAsyncThunk('vault/getFolders', async (_, thunkAPI) => {
    try { const { data } = await api.getVaultFolders(); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const createFolder = createAsyncThunk('vault/createFolder', async (payload, thunkAPI) => {
    try { const { data } = await api.createVaultFolder(payload); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const updateFolder = createAsyncThunk('vault/updateFolder', async ({ id, ...payload }, thunkAPI) => {
    try { const { data } = await api.updateVaultFolder(id, payload); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const deleteFolder = createAsyncThunk('vault/deleteFolder', async ({ id }, thunkAPI) => {
    try { const { data } = await api.deleteVaultFolder(id); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const importEntries = createAsyncThunk('vault/importEntries', async (payload, thunkAPI) => {
    try { const { data } = await api.importVaultEntries(payload); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const exportEntries = createAsyncThunk('vault/exportEntries', async (_, thunkAPI) => {
    try { const { data } = await api.exportVaultEntries(); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const getAuditLogs = createAsyncThunk('vault/getAuditLogs', async (params = {}, thunkAPI) => {
    try { const { data } = await api.getVaultAuditLogs(params); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const getDevices = createAsyncThunk('vault/getDevices', async (_, thunkAPI) => {
    try { const { data } = await api.getVaultDevices(); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const removeDevice = createAsyncThunk('vault/removeDevice', async ({ id }, thunkAPI) => {
    try { const { data } = await api.removeVaultDevice(id); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const getStats = createAsyncThunk('vault/getStats', async (_, thunkAPI) => {
    try { const { data } = await api.getVaultStats(); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const getSharedWithMe = createAsyncThunk('vault/getSharedWithMe', async (_, thunkAPI) => {
    try { const { data } = await api.getSharedWithMe(); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const getMyShares = createAsyncThunk('vault/getMyShares', async (_, thunkAPI) => {
    try { const { data } = await api.getMyShares(); return data }
    catch (err) { return rejectErr(thunkAPI, err) }
})

const vaultSlice = createSlice({
    name: 'vault',
    initialState,
    reducers: {
        clearVaultAlert: (state) => { state.alert = ''; state.variant = '' },
        resetVault: () => initialState,
    },
    extraReducers: (builder) => {
        const pending = (state) => { state.isLoading = true }
        const rejected = (state, action) => { state.isLoading = false; state.alert = action.payload?.message || 'Error'; state.variant = 'danger' }

        builder
            .addCase(getVaultStatus.pending, pending)
            .addCase(getVaultStatus.fulfilled, (state, action) => { state.isLoading = false; state.vaultStatus = action.payload })
            .addCase(getVaultStatus.rejected, (state, action) => { state.isLoading = false; state.vaultStatus = { hasVault: false, entryCount: 0, error: action.payload?.message } })
            .addCase(setupVault.pending, pending)
            .addCase(setupVault.fulfilled, (state, action) => { state.isLoading = false; state.alert = action.payload.message; state.variant = 'success'; state.vaultStatus = { hasVault: true, entryCount: 0 } })
            .addCase(setupVault.rejected, rejected)
            .addCase(unlockVault.pending, pending)
            .addCase(unlockVault.fulfilled, (state, action) => { state.isLoading = false; state.alert = action.payload.message; state.variant = 'success' })
            .addCase(unlockVault.rejected, rejected)
            .addCase(getEntries.pending, pending)
            .addCase(getEntries.fulfilled, (state, action) => { state.isLoading = false; state.entries = action.payload.result })
            .addCase(getEntries.rejected, rejected)
            .addCase(createEntry.pending, pending)
            .addCase(createEntry.fulfilled, (state, action) => { state.isLoading = false; state.alert = action.payload.message; state.variant = 'success'; state.entries = [action.payload.result, ...state.entries] })
            .addCase(createEntry.rejected, rejected)
            .addCase(updateEntry.pending, pending)
            .addCase(updateEntry.fulfilled, (state, action) => { state.isLoading = false; state.alert = action.payload.message; state.variant = 'success'; state.entries = state.entries.map(e => e._id === action.payload.result._id ? action.payload.result : e) })
            .addCase(updateEntry.rejected, rejected)
            .addCase(deleteEntry.fulfilled, (state, action) => { state.isLoading = false; state.alert = action.payload.message; state.variant = 'success' })
            .addCase(restoreEntry.fulfilled, (state, action) => { state.isLoading = false; state.alert = action.payload.message; state.variant = 'success' })
            .addCase(emptyTrash.fulfilled, (state, action) => { state.isLoading = false; state.alert = action.payload.message; state.variant = 'success' })
            .addCase(getFolders.fulfilled, (state, action) => { state.isLoading = false; state.folders = action.payload.result })
            .addCase(createFolder.fulfilled, (state, action) => { state.isLoading = false; state.folders = [...state.folders, action.payload.result]; state.alert = action.payload.message; state.variant = 'success' })
            .addCase(updateFolder.fulfilled, (state, action) => { state.isLoading = false; state.folders = state.folders.map(f => f._id === action.payload.result._id ? action.payload.result : f); state.alert = action.payload.message; state.variant = 'success' })
            .addCase(deleteFolder.fulfilled, (state, action) => { state.isLoading = false; state.alert = action.payload.message; state.variant = 'success' })
            .addCase(importEntries.pending, pending)
            .addCase(importEntries.fulfilled, (state, action) => { state.isLoading = false; state.alert = action.payload.message; state.variant = 'success' })
            .addCase(importEntries.rejected, rejected)
            .addCase(getAuditLogs.fulfilled, (state, action) => { state.isLoading = false; state.auditLogs = action.payload.result; state.auditTotal = action.payload.total })
            .addCase(getDevices.fulfilled, (state, action) => { state.isLoading = false; state.devices = action.payload.result })
            .addCase(removeDevice.fulfilled, (state, action) => { state.isLoading = false; state.alert = action.payload.message; state.variant = 'success' })
            .addCase(getStats.fulfilled, (state, action) => { state.isLoading = false; state.stats = action.payload.result })
            .addCase(getSharedWithMe.fulfilled, (state, action) => { state.isLoading = false; state.sharedWithMe = action.payload.result })
            .addCase(getMyShares.fulfilled, (state, action) => { state.isLoading = false; state.myShares = action.payload.result })
    }
})

export const { clearVaultAlert, resetVault } = vaultSlice.actions
export default vaultSlice.reducer
