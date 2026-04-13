import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const MAX_HISTORY = 50

const initialState = {
    pages: [],
    trashPages: [],
    userImages: [],
    currentPage: null,
    selectedElement: null,
    clipboard: null,
    history: [],
    historyIndex: -1,
    viewport: 'desktop',
    isDirty: false,
    alert: {},
    isLoading: false,
    trashLoading: false,
}

// --- Tree helpers ---

const findNode = (nodes, id) => {
    for (const node of nodes) {
        if (node.id === id) return node
        if (node.children?.length) {
            const found = findNode(node.children, id)
            if (found) return found
        }
    }
    return null
}

const findParentAndIndex = (nodes, id, parent = null) => {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) return { parent, index: i, siblings: nodes }
        if (nodes[i].children?.length) {
            const found = findParentAndIndex(nodes[i].children, id, nodes[i])
            if (found) return found
        }
    }
    return null
}

const removeNodeById = (nodes, id) => {
    return nodes
        .filter(n => n.id !== id)
        .map(n => n.children?.length ? { ...n, children: removeNodeById(n.children, id) } : n)
}

const deepCloneWithNewIds = (node) => ({
    ...node,
    id: uuidv4(),
    children: node.children?.map(deepCloneWithNewIds) || []
})

const updateNodeInTree = (nodes, id, updater) => {
    return nodes.map(n => {
        if (n.id === id) return updater(n)
        if (n.children?.length) return { ...n, children: updateNodeInTree(n.children, id, updater) }
        return n
    })
}

const insertAtPosition = (nodes, targetId, position, newNode) => {
    const result = []
    for (const node of nodes) {
        if (node.id === targetId && position === 'before') result.push(newNode)
        if (node.id === targetId && position === 'inside') {
            result.push({ ...node, children: [...(node.children || []), newNode] })
        } else {
            result.push(node.children?.length
                ? { ...node, children: insertAtPosition(node.children, targetId, position, newNode) }
                : node
            )
        }
        if (node.id === targetId && position === 'after') result.push(newNode)
    }
    return result
}

// --- Thunks ---

export const fetchPages = createAsyncThunk('pageBuilder/fetchPages', async (_, thunkAPI) => {
    try {
        const response = await api.getPages()
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to load pages' } })
    }
})

export const fetchPageForEdit = createAsyncThunk('pageBuilder/fetchPageForEdit', async (id, thunkAPI) => {
    try {
        const response = await api.getPageForEdit(id)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to load page' } })
    }
})

export const fetchPageBySlug = createAsyncThunk('pageBuilder/fetchPageBySlug', async (slug, thunkAPI) => {
    try {
        const response = await api.getPageBySlug(slug)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Page not found' } })
    }
})

export const createNewPage = createAsyncThunk('pageBuilder/createPage', async (formData, thunkAPI) => {
    try {
        const response = await api.createPage(formData)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to create page' } })
    }
})

export const savePage = createAsyncThunk('pageBuilder/savePage', async (formData, thunkAPI) => {
    try {
        const response = await api.updatePage(formData)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to save page' } })
    }
})

export const removePage = createAsyncThunk('pageBuilder/deletePage', async (id, thunkAPI) => {
    try {
        const response = await api.deletePage(id)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to delete page' } })
    }
})

export const duplicatePageThunk = createAsyncThunk('pageBuilder/duplicatePage', async (formData, thunkAPI) => {
    try {
        const response = await api.duplicatePage(formData)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to duplicate page' } })
    }
})

export const fetchTrash = createAsyncThunk('pageBuilder/fetchTrash', async (_, thunkAPI) => {
    try {
        const response = await api.getTrashPages()
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to load trash' } })
    }
})

export const restorePageThunk = createAsyncThunk('pageBuilder/restorePage', async (id, thunkAPI) => {
    try {
        const response = await api.restorePage(id)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to restore page' } })
    }
})

export const permanentDeleteThunk = createAsyncThunk('pageBuilder/permanentDelete', async (id, thunkAPI) => {
    try {
        const response = await api.permanentDeletePage(id)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to delete page' } })
    }
})

export const emptyTrashThunk = createAsyncThunk('pageBuilder/emptyTrash', async (_, thunkAPI) => {
    try {
        const response = await api.emptyTrash()
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to empty trash' } })
    }
})

export const togglePrivacyThunk = createAsyncThunk('pageBuilder/togglePrivacy', async (id, thunkAPI) => {
    try {
        const response = await api.togglePagePrivacy(id)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to toggle privacy' } })
    }
})

export const fetchImages = createAsyncThunk('pageBuilder/fetchImages', async (_, thunkAPI) => {
    try {
        const response = await api.getPageImages()
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to load images' } })
    }
})

export const uploadImagesThunk = createAsyncThunk('pageBuilder/uploadImages', async (formData, thunkAPI) => {
    try {
        const response = await api.uploadPageImages(formData)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to upload images' } })
    }
})

export const deleteImageThunk = createAsyncThunk('pageBuilder/deleteImage', async (id, thunkAPI) => {
    try {
        const response = await api.deletePageImage(id)
        return response
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data || { alert: { variant: 'danger', message: 'Failed to remove image' } })
    }
})

// --- Slice ---

const pageBuilderSlice = createSlice({
    name: 'pageBuilder',
    initialState,
    reducers: {
        setSelectedElement: (state, action) => {
            state.selectedElement = action.payload
        },
        setViewport: (state, action) => {
            state.viewport = action.payload
        },
        clearCurrentPage: (state) => {
            state.currentPage = null
            state.selectedElement = null
            state.history = []
            state.historyIndex = -1
            state.isDirty = false
        },
        clearAlert: (state) => {
            state.alert = {}
        },
        pushHistory: (state) => {
            if (!state.currentPage) return
            const snapshot = JSON.parse(JSON.stringify(state.currentPage.layout))
            const newHistory = state.history.slice(0, state.historyIndex + 1)
            newHistory.push(snapshot)
            if (newHistory.length > MAX_HISTORY) newHistory.shift()
            state.history = newHistory
            state.historyIndex = newHistory.length - 1
        },
        undo: (state) => {
            if (state.historyIndex <= 0 || !state.currentPage) return
            state.historyIndex -= 1
            state.currentPage.layout = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
            state.isDirty = true
            state.selectedElement = null
        },
        redo: (state) => {
            if (state.historyIndex >= state.history.length - 1 || !state.currentPage) return
            state.historyIndex += 1
            state.currentPage.layout = JSON.parse(JSON.stringify(state.history[state.historyIndex]))
            state.isDirty = true
            state.selectedElement = null
        },
        addElement: (state, action) => {
            if (!state.currentPage) return
            const { element, targetId, position } = action.payload
            const newNode = { ...element, id: element.id || uuidv4() }
            if (targetId && position) {
                state.currentPage.layout = insertAtPosition(state.currentPage.layout, targetId, position, newNode)
            } else {
                state.currentPage.layout.push(newNode)
            }
            state.isDirty = true
            state.selectedElement = newNode.id
        },
        removeElement: (state, action) => {
            if (!state.currentPage) return
            const id = action.payload
            state.currentPage.layout = removeNodeById(state.currentPage.layout, id)
            if (state.selectedElement === id) state.selectedElement = null
            state.isDirty = true
        },
        updateElement: (state, action) => {
            if (!state.currentPage) return
            const { id, props, styles } = action.payload
            state.currentPage.layout = updateNodeInTree(state.currentPage.layout, id, (node) => ({
                ...node,
                props: props !== undefined ? { ...node.props, ...props } : node.props,
                styles: styles !== undefined ? { ...node.styles, ...styles } : node.styles,
            }))
            state.isDirty = true
        },
        moveElement: (state, action) => {
            if (!state.currentPage) return
            const { elementId, targetId, position } = action.payload
            const node = findNode(state.currentPage.layout, elementId)
            if (!node) return
            const clone = JSON.parse(JSON.stringify(node))
            let layout = removeNodeById(state.currentPage.layout, elementId)
            if (targetId && position) {
                layout = insertAtPosition(layout, targetId, position, clone)
            } else {
                layout.push(clone)
            }
            state.currentPage.layout = layout
            state.isDirty = true
        },
        duplicateElement: (state, action) => {
            if (!state.currentPage) return
            const id = action.payload
            const loc = findParentAndIndex(state.currentPage.layout, id)
            if (!loc) return
            const original = loc.siblings[loc.index]
            const clone = deepCloneWithNewIds(JSON.parse(JSON.stringify(original)))
            loc.siblings.splice(loc.index + 1, 0, clone)
            state.selectedElement = clone.id
            state.isDirty = true
        },
        copyElement: (state, action) => {
            if (!state.currentPage) return
            const node = findNode(state.currentPage.layout, action.payload)
            if (node) state.clipboard = JSON.parse(JSON.stringify(node))
        },
        pasteElement: (state, action) => {
            if (!state.currentPage || !state.clipboard) return
            const targetId = action.payload || state.selectedElement
            const clone = deepCloneWithNewIds(JSON.parse(JSON.stringify(state.clipboard)))
            if (targetId) {
                state.currentPage.layout = insertAtPosition(state.currentPage.layout, targetId, 'after', clone)
            } else {
                state.currentPage.layout.push(clone)
            }
            state.selectedElement = clone.id
            state.isDirty = true
        },
        updatePageMeta: (state, action) => {
            if (!state.currentPage) return
            Object.assign(state.currentPage, action.payload)
            state.isDirty = true
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPages.pending, (state) => { state.isLoading = true })
            .addCase(fetchPages.fulfilled, (state, action) => {
                state.pages = action.payload.data.result
                state.isLoading = false
            })
            .addCase(fetchPages.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
                state.isLoading = false
            })
            .addCase(fetchPageForEdit.pending, (state) => { state.isLoading = true })
            .addCase(fetchPageForEdit.fulfilled, (state, action) => {
                state.currentPage = action.payload.data.result
                state.selectedElement = null
                const snapshot = JSON.parse(JSON.stringify(action.payload.data.result.layout || []))
                state.history = [snapshot]
                state.historyIndex = 0
                state.isDirty = false
                state.isLoading = false
            })
            .addCase(fetchPageForEdit.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
                state.isLoading = false
            })
            .addCase(fetchPageBySlug.pending, (state) => { state.isLoading = true })
            .addCase(fetchPageBySlug.fulfilled, (state, action) => {
                state.currentPage = action.payload.data.result
                state.isLoading = false
            })
            .addCase(fetchPageBySlug.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
                state.isLoading = false
            })
            .addCase(createNewPage.fulfilled, (state, action) => {
                state.currentPage = action.payload.data.result
                state.selectedElement = null
                state.history = [[]]
                state.historyIndex = 0
                state.isDirty = false
                state.alert = action.payload.data.alert || {}
            })
            .addCase(createNewPage.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
            .addCase(savePage.fulfilled, (state, action) => {
                state.currentPage = action.payload.data.result
                state.isDirty = false
                state.alert = action.payload.data.alert || {}
            })
            .addCase(savePage.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
            .addCase(removePage.fulfilled, (state, action) => {
                state.pages = action.payload.data.result
                state.alert = action.payload.data.alert || {}
            })
            .addCase(removePage.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
            .addCase(duplicatePageThunk.fulfilled, (state, action) => {
                state.pages = action.payload.data.result
                state.alert = action.payload.data.alert || {}
            })
            .addCase(duplicatePageThunk.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
            .addCase(fetchTrash.pending, (state) => { state.trashLoading = true })
            .addCase(fetchTrash.fulfilled, (state, action) => {
                state.trashPages = action.payload.data.result
                state.trashLoading = false
            })
            .addCase(fetchTrash.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
                state.trashLoading = false
            })
            .addCase(restorePageThunk.fulfilled, (state, action) => {
                state.trashPages = action.payload.data.result
                state.alert = action.payload.data.alert || {}
            })
            .addCase(restorePageThunk.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
            .addCase(permanentDeleteThunk.fulfilled, (state, action) => {
                state.trashPages = action.payload.data.result
                state.alert = action.payload.data.alert || {}
            })
            .addCase(permanentDeleteThunk.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
            .addCase(emptyTrashThunk.fulfilled, (state, action) => {
                state.trashPages = []
                state.alert = action.payload.data.alert || {}
            })
            .addCase(emptyTrashThunk.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
            .addCase(togglePrivacyThunk.fulfilled, (state, action) => {
                state.pages = action.payload.data.result
                state.alert = action.payload.data.alert || {}
            })
            .addCase(togglePrivacyThunk.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
            .addCase(fetchImages.fulfilled, (state, action) => {
                state.userImages = action.payload.data.result
            })
            .addCase(fetchImages.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
            .addCase(uploadImagesThunk.fulfilled, (state, action) => {
                state.userImages = action.payload.data.result
                state.alert = action.payload.data.alert || {}
            })
            .addCase(uploadImagesThunk.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
            .addCase(deleteImageThunk.fulfilled, (state, action) => {
                state.userImages = action.payload.data.result
                state.alert = action.payload.data.alert || {}
            })
            .addCase(deleteImageThunk.rejected, (state, action) => {
                state.alert = action.payload?.alert || {}
            })
    }
})

export const {
    setSelectedElement, setViewport, clearCurrentPage, clearAlert,
    pushHistory, undo, redo,
    addElement, removeElement, updateElement, moveElement, duplicateElement,
    copyElement, pasteElement, updatePageMeta,
} = pageBuilderSlice.actions

export default pageBuilderSlice.reducer
