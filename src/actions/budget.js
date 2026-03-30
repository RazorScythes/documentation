import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    dashboard       : null,
    categories      : [],
    expenses        : [],
    savings         : {},
    savingsHistory  : [],
    debts           : [],
    alert           : {},
    isLoading       : false,
}

// ==================== SEED ====================

export const seedBudgetFromSheet = createAsyncThunk('budget/seedFromSheet', async (data, thunkAPI) => {
    try {
        const response = await api.seedBudgetFromSheet(data)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to import sheet data' } })
    }
})

// ==================== DASHBOARD ====================

export const getBudgetDashboard = createAsyncThunk('budget/getDashboard', async (params, thunkAPI) => {
    try {
        const response = await api.getBudgetDashboard(params)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load dashboard' } })
    }
})

// ==================== CATEGORIES ====================

export const getBudgetCategories = createAsyncThunk('budget/getCategories', async (_, thunkAPI) => {
    try {
        const response = await api.getBudgetCategories()
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load categories' } })
    }
})

export const createBudgetCategory = createAsyncThunk('budget/createCategory', async (formData, thunkAPI) => {
    try {
        const response = await api.createBudgetCategory(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to create category' } })
    }
})

export const updateBudgetCategory = createAsyncThunk('budget/updateCategory', async (formData, thunkAPI) => {
    try {
        const response = await api.updateBudgetCategory(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update category' } })
    }
})

export const deleteBudgetCategory = createAsyncThunk('budget/deleteCategory', async (id, thunkAPI) => {
    try {
        const response = await api.deleteBudgetCategory(id)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete category' } })
    }
})

// ==================== EXPENSES ====================

export const getBudgetExpenses = createAsyncThunk('budget/getExpenses', async (params, thunkAPI) => {
    try {
        const response = await api.getBudgetExpenses(params)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load expenses' } })
    }
})

export const createBudgetExpense = createAsyncThunk('budget/createExpense', async (formData, thunkAPI) => {
    try {
        const response = await api.createBudgetExpense(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to add transaction' } })
    }
})

export const updateBudgetExpense = createAsyncThunk('budget/updateExpense', async (formData, thunkAPI) => {
    try {
        const response = await api.updateBudgetExpense(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update transaction' } })
    }
})

export const deleteBudgetExpense = createAsyncThunk('budget/deleteExpense', async (id, thunkAPI) => {
    try {
        const response = await api.deleteBudgetExpense(id)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete transaction' } })
    }
})

export const bulkDeleteBudgetExpenses = createAsyncThunk('budget/bulkDeleteExpenses', async (data, thunkAPI) => {
    try {
        const response = await api.bulkDeleteBudgetExpenses(data)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete transactions' } })
    }
})

export const bulkUpdateBudgetCategory = createAsyncThunk('budget/bulkUpdateCategory', async (data, thunkAPI) => {
    try {
        const response = await api.bulkUpdateBudgetCategory(data)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update category' } })
    }
})

// ==================== SAVINGS ====================

export const getBudgetSavings = createAsyncThunk('budget/getSavings', async (_, thunkAPI) => {
    try {
        const response = await api.getSavings()
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load savings' } })
    }
})

export const saveBudgetSavings = createAsyncThunk('budget/saveSavings', async (data, thunkAPI) => {
    try {
        const response = await api.saveSavings(data)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to save savings' } })
    }
})

export const getBudgetSavingsHistory = createAsyncThunk('budget/getSavingsHistory', async (_, thunkAPI) => {
    try {
        const response = await api.getSavingsHistory()
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load savings history' } })
    }
})

export const deleteBudgetSavingsHistory = createAsyncThunk('budget/deleteSavingsHistory', async (id, thunkAPI) => {
    try {
        const response = await api.deleteSavingsHistory(id)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete history entry' } })
    }
})

// ==================== DEBTS ====================

export const getDebts = createAsyncThunk('budget/getDebts', async (_, thunkAPI) => {
    try {
        const response = await api.getDebts()
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load debts' } })
    }
})

export const createDebt = createAsyncThunk('budget/createDebt', async (formData, thunkAPI) => {
    try {
        const response = await api.createDebt(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to create debt' } })
    }
})

export const updateDebt = createAsyncThunk('budget/updateDebt', async (formData, thunkAPI) => {
    try {
        const response = await api.updateDebt(formData)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update debt' } })
    }
})

export const deleteDebt = createAsyncThunk('budget/deleteDebt', async (id, thunkAPI) => {
    try {
        const response = await api.deleteDebt(id)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete debt' } })
    }
})

export const addDebtPayment = createAsyncThunk('budget/addDebtPayment', async ({ id, amount, notes, category, paymentMethod }, thunkAPI) => {
    try {
        const response = await api.addDebtPayment(id, { amount, notes, category, paymentMethod })
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to add payment' } })
    }
})

export const removeDebtPayment = createAsyncThunk('budget/removeDebtPayment', async ({ id, paymentId }, thunkAPI) => {
    try {
        const response = await api.removeDebtPayment(id, paymentId)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to remove payment' } })
    }
})

export const toggleDebtStatus = createAsyncThunk('budget/toggleDebtStatus', async (id, thunkAPI) => {
    try {
        const response = await api.toggleDebtStatus(id)
        return response
    } catch (err) {
        if (err.response?.data)
            return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update status' } })
    }
})

export const budgetSlice = createSlice({
    name: 'budget',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(seedBudgetFromSheet.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(seedBudgetFromSheet.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(getBudgetDashboard.pending, (state) => { state.isLoading = true }),
        builder.addCase(getBudgetDashboard.fulfilled, (state, action) => {
            state.dashboard = action.payload.data.result
            state.isLoading = false
        }),
        builder.addCase(getBudgetDashboard.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
            state.isLoading = false
        }),

        builder.addCase(getBudgetCategories.fulfilled, (state, action) => {
            state.categories = action.payload.data.result
        }),
        builder.addCase(getBudgetCategories.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(createBudgetCategory.fulfilled, (state, action) => {
            state.categories = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(createBudgetCategory.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(updateBudgetCategory.fulfilled, (state, action) => {
            state.categories = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(updateBudgetCategory.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(deleteBudgetCategory.fulfilled, (state, action) => {
            state.categories = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(deleteBudgetCategory.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(getBudgetExpenses.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
        }),
        builder.addCase(getBudgetExpenses.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(createBudgetExpense.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(createBudgetExpense.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(updateBudgetExpense.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(updateBudgetExpense.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(deleteBudgetExpense.fulfilled, (state, action) => {
            state.alert = action.payload.data.alert
        }),
        builder.addCase(deleteBudgetExpense.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(bulkDeleteBudgetExpenses.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(bulkDeleteBudgetExpenses.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(bulkUpdateBudgetCategory.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(bulkUpdateBudgetCategory.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(getBudgetSavings.fulfilled, (state, action) => {
            state.savings = action.payload.data.result || {}
        }),
        builder.addCase(getBudgetSavings.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(saveBudgetSavings.fulfilled, (state, action) => {
            state.savings = action.payload.data.result || {}
            state.alert = action.payload.data.alert
        }),
        builder.addCase(saveBudgetSavings.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(getBudgetSavingsHistory.fulfilled, (state, action) => {
            state.savingsHistory = action.payload.data.result || []
        }),
        builder.addCase(getBudgetSavingsHistory.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(deleteBudgetSavingsHistory.fulfilled, (state, action) => {
            state.savingsHistory = action.payload.data.result || []
            state.alert = action.payload.data.alert
        }),
        builder.addCase(deleteBudgetSavingsHistory.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(getDebts.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
        }),
        builder.addCase(getDebts.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(createDebt.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(createDebt.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(updateDebt.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(updateDebt.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(deleteDebt.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(deleteDebt.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(addDebtPayment.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(addDebtPayment.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(removeDebtPayment.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(removeDebtPayment.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        }),

        builder.addCase(toggleDebtStatus.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        }),
        builder.addCase(toggleDebtStatus.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
        })
    },
    reducers: {
        clearAlert: (state) => {
            state.alert = {}
        },
    },
})

export const { clearAlert } = budgetSlice.actions

export default budgetSlice.reducer
