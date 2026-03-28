import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    error       : '',
    isLoading   : false,
    alert       : '',
    variant     : '',
    data        : [],
    trash       : [],
    trashLoading: false,
}

const rejectErr = (thunkAPI, err) => {
    if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
    return thunkAPI.rejectWithValue({ variant: 'danger', message: 'There was a problem with the server.' })
}

export const fetchGames = createAsyncThunk('gameManager/fetchGames', async (_, thunkAPI) => {
    try { return await api.getMyGames() }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const createGame = createAsyncThunk('gameManager/createGame', async (form, thunkAPI) => {
    try { return await api.createGame(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const updateGame = createAsyncThunk('gameManager/updateGame', async ({ id, data }, thunkAPI) => {
    try { return await api.updateGame(id, data) }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const deleteGame = createAsyncThunk('gameManager/deleteGame', async (id, thunkAPI) => {
    try { return await api.deleteGame(id) }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const bulkDeleteGames = createAsyncThunk('gameManager/bulkDeleteGames', async (form, thunkAPI) => {
    try { return await api.bulkDeleteGames(form) }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const togglePrivacy = createAsyncThunk('gameManager/togglePrivacy', async (id, thunkAPI) => {
    try { return await api.toggleGamePrivacy(id) }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const toggleStrict = createAsyncThunk('gameManager/toggleStrict', async (id, thunkAPI) => {
    try { return await api.toggleGameStrict(id) }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const fetchTrash = createAsyncThunk('gameManager/fetchTrash', async (_, thunkAPI) => {
    try { return await api.getGameTrash() }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const restoreGame = createAsyncThunk('gameManager/restoreGame', async (id, thunkAPI) => {
    try { return await api.restoreGame(id) }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const permanentDeleteGame = createAsyncThunk('gameManager/permanentDeleteGame', async (id, thunkAPI) => {
    try { return await api.permanentDeleteGame(id) }
    catch (err) { return rejectErr(thunkAPI, err) }
})

export const emptyTrash = createAsyncThunk('gameManager/emptyTrash', async (_, thunkAPI) => {
    try { return await api.emptyGameTrash() }
    catch (err) { return rejectErr(thunkAPI, err) }
})

const fulfilled = (state, action) => {
    state.data      = action.payload.data.result
    state.alert     = action.payload.data.alert || ''
    state.variant   = action.payload.data.variant || ''
    state.error     = ''
    state.isLoading = false
}

const trashFulfilled = (state, action) => {
    state.trash        = action.payload.data.result
    state.alert        = action.payload.data.alert || ''
    state.variant      = action.payload.data.variant || ''
    state.trashLoading = false
}

const rejected = (state, action) => {
    state.alert     = action.payload?.message || 'Something went wrong'
    state.variant   = action.payload?.variant || 'danger'
    state.isLoading = false
    state.trashLoading = false
}

export const gameManagerSlice = createSlice({
    name: 'gameManager',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(fetchGames.pending, (state) => { state.isLoading = true }),
        builder.addCase(fetchGames.fulfilled, (state, action) => {
            state.data      = action.payload.data.result
            state.error     = ''
            state.isLoading = false
        }),
        builder.addCase(fetchGames.rejected, rejected),

        builder.addCase(createGame.fulfilled, fulfilled),
        builder.addCase(createGame.rejected, rejected),

        builder.addCase(updateGame.fulfilled, fulfilled),
        builder.addCase(updateGame.rejected, rejected),

        builder.addCase(deleteGame.fulfilled, fulfilled),
        builder.addCase(deleteGame.rejected, rejected),

        builder.addCase(bulkDeleteGames.fulfilled, fulfilled),
        builder.addCase(bulkDeleteGames.rejected, rejected),

        builder.addCase(togglePrivacy.fulfilled, fulfilled),
        builder.addCase(togglePrivacy.rejected, rejected),

        builder.addCase(toggleStrict.fulfilled, fulfilled),
        builder.addCase(toggleStrict.rejected, rejected),

        builder.addCase(fetchTrash.pending, (state) => { state.trashLoading = true }),
        builder.addCase(fetchTrash.fulfilled, (state, action) => {
            state.trash        = action.payload.data.result
            state.trashLoading = false
        }),
        builder.addCase(fetchTrash.rejected, rejected),

        builder.addCase(restoreGame.fulfilled, trashFulfilled),
        builder.addCase(restoreGame.rejected, rejected),

        builder.addCase(permanentDeleteGame.fulfilled, trashFulfilled),
        builder.addCase(permanentDeleteGame.rejected, rejected),

        builder.addCase(emptyTrash.fulfilled, trashFulfilled),
        builder.addCase(emptyTrash.rejected, rejected)
    },
    reducers: {
        clearGameAlert: (state) => {
            state.alert     = ''
            state.variant   = ''
        }
    },
})

export const { clearGameAlert } = gameManagerSlice.actions

export default gameManagerSlice.reducer
