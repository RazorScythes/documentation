import * as api from '../endpoint'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
    dashboard       : null,
    categories      : [],
    expenses        : [],
    savings         : {},
    savingsHistory  : [],
    debts           : [],
    budgetLists     : [],
    goals           : [],
    searchResults   : [],
    alert           : {},
    isLoading       : false,
    isSavingsLoading: false,
}

// ==================== DASHBOARD ====================

export const getBudgetDashboard = createAsyncThunk('budget/getDashboard', async (params, thunkAPI) => {
    try {
        const response = await api.getBudgetDashboard(params)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load dashboard' } })
    }
})

// ==================== CATEGORIES ====================

export const getBudgetCategories = createAsyncThunk('budget/getCategories', async (_, thunkAPI) => {
    try {
        const response = await api.getBudgetCategories()
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load categories' } })
    }
})

export const createBudgetCategory = createAsyncThunk('budget/createCategory', async (formData, thunkAPI) => {
    try {
        const response = await api.createBudgetCategory(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to create category' } })
    }
})

export const updateBudgetCategory = createAsyncThunk('budget/updateCategory', async (formData, thunkAPI) => {
    try {
        const response = await api.updateBudgetCategory(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update category' } })
    }
})

export const deleteBudgetCategory = createAsyncThunk('budget/deleteCategory', async (id, thunkAPI) => {
    try {
        const response = await api.deleteBudgetCategory(id)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete category' } })
    }
})

export const shareBudgetCategory = createAsyncThunk('budget/shareCategory', async (formData, thunkAPI) => {
    try {
        const response = await api.shareBudgetCategory(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to share category' } })
    }
})

export const unshareBudgetCategory = createAsyncThunk('budget/unshareCategory', async (formData, thunkAPI) => {
    try {
        const response = await api.unshareBudgetCategory(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to unshare category' } })
    }
})

// ==================== EXPENSES ====================

export const getBudgetExpenses = createAsyncThunk('budget/getExpenses', async (params, thunkAPI) => {
    try {
        const response = await api.getBudgetExpenses(params)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load expenses' } })
    }
})

export const createBudgetExpense = createAsyncThunk('budget/createExpense', async (formData, thunkAPI) => {
    try {
        const response = await api.createBudgetExpense(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to add transaction' } })
    }
})

export const updateBudgetExpense = createAsyncThunk('budget/updateExpense', async (formData, thunkAPI) => {
    try {
        const response = await api.updateBudgetExpense(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update transaction' } })
    }
})

export const deleteBudgetExpense = createAsyncThunk('budget/deleteExpense', async ({ id, month, year }, thunkAPI) => {
    try {
        const response = await api.deleteBudgetExpense(id, { month, year })
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete transaction' } })
    }
})

export const bulkDeleteBudgetExpenses = createAsyncThunk('budget/bulkDeleteExpenses', async (data, thunkAPI) => {
    try {
        const response = await api.bulkDeleteBudgetExpenses(data)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete transactions' } })
    }
})

export const bulkUpdateBudgetCategory = createAsyncThunk('budget/bulkUpdateCategory', async (data, thunkAPI) => {
    try {
        const response = await api.bulkUpdateBudgetCategory(data)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update category' } })
    }
})

// ==================== SEARCH ====================

export const searchBudgetExpenses = createAsyncThunk('budget/searchExpenses', async (params, thunkAPI) => {
    try {
        const response = await api.searchBudgetExpenses(params)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Search failed' } })
    }
})

// ==================== CSV IMPORT ====================

export const importBudgetCSV = createAsyncThunk('budget/importCSV', async (data, thunkAPI) => {
    try {
        const response = await api.importBudgetCSV(data)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Import failed' } })
    }
})

// ==================== RECURRING ====================

export const processRecurring = createAsyncThunk('budget/processRecurring', async (_, thunkAPI) => {
    try {
        const response = await api.processRecurring()
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to process recurring' } })
    }
})

// ==================== SAVINGS ====================

export const getBudgetSavings = createAsyncThunk('budget/getSavings', async (_, thunkAPI) => {
    try {
        const response = await api.getSavings()
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load savings' } })
    }
})

export const saveBudgetSavings = createAsyncThunk('budget/saveSavings', async (data, thunkAPI) => {
    try {
        const response = await api.saveSavings(data)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to save savings' } })
    }
})

export const getBudgetSavingsHistory = createAsyncThunk('budget/getSavingsHistory', async (_, thunkAPI) => {
    try {
        const response = await api.getSavingsHistory()
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load savings history' } })
    }
})

export const deleteBudgetSavingsHistory = createAsyncThunk('budget/deleteSavingsHistory', async (id, thunkAPI) => {
    try {
        const response = await api.deleteSavingsHistory(id)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete history entry' } })
    }
})

// ==================== DEBTS ====================

export const getDebts = createAsyncThunk('budget/getDebts', async (_, thunkAPI) => {
    try {
        const response = await api.getDebts()
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load debts' } })
    }
})

export const createDebt = createAsyncThunk('budget/createDebt', async (formData, thunkAPI) => {
    try {
        const response = await api.createDebt(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to create debt' } })
    }
})

export const updateDebt = createAsyncThunk('budget/updateDebt', async (formData, thunkAPI) => {
    try {
        const response = await api.updateDebt(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update debt' } })
    }
})

export const deleteDebt = createAsyncThunk('budget/deleteDebt', async (id, thunkAPI) => {
    try {
        const response = await api.deleteDebt(id)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete debt' } })
    }
})

export const addDebtPayment = createAsyncThunk('budget/addDebtPayment', async ({ id, amount, notes, category, paymentMethod }, thunkAPI) => {
    try {
        const response = await api.addDebtPayment(id, { amount, notes, category, paymentMethod })
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to add payment' } })
    }
})

export const removeDebtPayment = createAsyncThunk('budget/removeDebtPayment', async ({ id, paymentId }, thunkAPI) => {
    try {
        const response = await api.removeDebtPayment(id, paymentId)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to remove payment' } })
    }
})

export const toggleDebtStatus = createAsyncThunk('budget/toggleDebtStatus', async (id, thunkAPI) => {
    try {
        const response = await api.toggleDebtStatus(id)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update status' } })
    }
})

// ==================== BUDGET LISTS ====================

export const getBudgetLists = createAsyncThunk('budget/getBudgetLists', async (_, thunkAPI) => {
    try {
        const response = await api.getBudgetLists()
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load lists' } })
    }
})

export const createBudgetList = createAsyncThunk('budget/createBudgetList', async (formData, thunkAPI) => {
    try {
        const response = await api.createBudgetList(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to create list' } })
    }
})

export const updateBudgetList = createAsyncThunk('budget/updateBudgetList', async (formData, thunkAPI) => {
    try {
        const response = await api.updateBudgetList(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update list' } })
    }
})

export const deleteBudgetList = createAsyncThunk('budget/deleteBudgetList', async (id, thunkAPI) => {
    try {
        const response = await api.deleteBudgetList(id)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete list' } })
    }
})

// ==================== FINANCIAL GOALS ====================

export const getFinancialGoals = createAsyncThunk('budget/getGoals', async (_, thunkAPI) => {
    try {
        const response = await api.getFinancialGoals()
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to load goals' } })
    }
})

export const createFinancialGoal = createAsyncThunk('budget/createGoal', async (formData, thunkAPI) => {
    try {
        const response = await api.createFinancialGoal(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to create goal' } })
    }
})

export const updateFinancialGoal = createAsyncThunk('budget/updateGoal', async (formData, thunkAPI) => {
    try {
        const response = await api.updateFinancialGoal(formData)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to update goal' } })
    }
})

export const deleteFinancialGoal = createAsyncThunk('budget/deleteGoal', async (id, thunkAPI) => {
    try {
        const response = await api.deleteFinancialGoal(id)
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to delete goal' } })
    }
})

export const addGoalContribution = createAsyncThunk('budget/addGoalContribution', async ({ id, amount, notes }, thunkAPI) => {
    try {
        const response = await api.addGoalContribution(id, { amount, notes })
        return response
    } catch (err) {
        if (err.response?.data) return thunkAPI.rejectWithValue(err.response.data)
        return thunkAPI.rejectWithValue({ alert: { variant: 'danger', message: 'Failed to add contribution' } })
    }
})

// ==================== SLICE ====================

export const budgetSlice = createSlice({
    name: 'budget',
    initialState,
    extraReducers: (builder) => {
        // Dashboard
        builder.addCase(getBudgetDashboard.pending, (state) => { state.isLoading = true })
        builder.addCase(getBudgetDashboard.fulfilled, (state, action) => {
            state.dashboard = action.payload.data.result
            state.isLoading = false
        })
        builder.addCase(getBudgetDashboard.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
            state.isLoading = false
        })

        // Categories
        builder.addCase(getBudgetCategories.fulfilled, (state, action) => { state.categories = action.payload.data.result })
        builder.addCase(getBudgetCategories.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(createBudgetCategory.fulfilled, (state, action) => {
            state.categories = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(createBudgetCategory.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(updateBudgetCategory.fulfilled, (state, action) => {
            state.categories = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(updateBudgetCategory.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(deleteBudgetCategory.fulfilled, (state, action) => {
            state.categories = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(deleteBudgetCategory.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(shareBudgetCategory.fulfilled, (state, action) => {
            state.categories = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(shareBudgetCategory.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(unshareBudgetCategory.fulfilled, (state, action) => {
            state.categories = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(unshareBudgetCategory.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        // Expenses
        builder.addCase(getBudgetExpenses.fulfilled, (state, action) => { state.expenses = action.payload.data.result })
        builder.addCase(getBudgetExpenses.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(createBudgetExpense.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(createBudgetExpense.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(updateBudgetExpense.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(updateBudgetExpense.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(deleteBudgetExpense.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(deleteBudgetExpense.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(bulkDeleteBudgetExpenses.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(bulkDeleteBudgetExpenses.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(bulkUpdateBudgetCategory.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(bulkUpdateBudgetCategory.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        // Search
        builder.addCase(searchBudgetExpenses.fulfilled, (state, action) => { state.searchResults = action.payload.data.result })
        builder.addCase(searchBudgetExpenses.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        // CSV Import
        builder.addCase(importBudgetCSV.fulfilled, (state, action) => {
            state.expenses = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(importBudgetCSV.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        // Recurring
        builder.addCase(processRecurring.fulfilled, (state, action) => {
            if (action.payload.data.alert) state.alert = action.payload.data.alert
        })
        builder.addCase(processRecurring.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        // Savings (with loading states - Bug 5 fix)
        builder.addCase(getBudgetSavings.pending, (state) => { state.isSavingsLoading = true })
        builder.addCase(getBudgetSavings.fulfilled, (state, action) => {
            state.savings = action.payload.data.result || {}
            state.isSavingsLoading = false
        })
        builder.addCase(getBudgetSavings.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
            state.isSavingsLoading = false
        })

        builder.addCase(saveBudgetSavings.fulfilled, (state, action) => {
            state.savings = action.payload.data.result || {}
            state.alert = action.payload.data.alert
        })
        builder.addCase(saveBudgetSavings.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(getBudgetSavingsHistory.pending, (state) => { state.isSavingsLoading = true })
        builder.addCase(getBudgetSavingsHistory.fulfilled, (state, action) => {
            state.savingsHistory = action.payload.data.result || []
            state.isSavingsLoading = false
        })
        builder.addCase(getBudgetSavingsHistory.rejected, (state, action) => {
            state.alert = action.payload?.alert || {}
            state.isSavingsLoading = false
        })

        builder.addCase(deleteBudgetSavingsHistory.fulfilled, (state, action) => {
            state.savingsHistory = action.payload.data.result || []
            state.alert = action.payload.data.alert
        })
        builder.addCase(deleteBudgetSavingsHistory.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        // Debts
        builder.addCase(getDebts.fulfilled, (state, action) => { state.debts = action.payload.data.result })
        builder.addCase(getDebts.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(createDebt.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(createDebt.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(updateDebt.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(updateDebt.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(deleteDebt.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(deleteDebt.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(addDebtPayment.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(addDebtPayment.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(removeDebtPayment.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(removeDebtPayment.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(toggleDebtStatus.fulfilled, (state, action) => {
            state.debts = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(toggleDebtStatus.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        // Budget Lists
        builder.addCase(getBudgetLists.fulfilled, (state, action) => { state.budgetLists = action.payload.data.result })
        builder.addCase(getBudgetLists.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(createBudgetList.fulfilled, (state, action) => {
            state.budgetLists = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(createBudgetList.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(updateBudgetList.fulfilled, (state, action) => {
            state.budgetLists = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(updateBudgetList.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(deleteBudgetList.fulfilled, (state, action) => {
            state.budgetLists = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(deleteBudgetList.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        // Financial Goals
        builder.addCase(getFinancialGoals.fulfilled, (state, action) => { state.goals = action.payload.data.result })
        builder.addCase(getFinancialGoals.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(createFinancialGoal.fulfilled, (state, action) => {
            state.goals = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(createFinancialGoal.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(updateFinancialGoal.fulfilled, (state, action) => {
            state.goals = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(updateFinancialGoal.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(deleteFinancialGoal.fulfilled, (state, action) => {
            state.goals = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(deleteFinancialGoal.rejected, (state, action) => { state.alert = action.payload?.alert || {} })

        builder.addCase(addGoalContribution.fulfilled, (state, action) => {
            state.goals = action.payload.data.result
            state.alert = action.payload.data.alert
        })
        builder.addCase(addGoalContribution.rejected, (state, action) => { state.alert = action.payload?.alert || {} })
    },
    reducers: {
        clearAlert: (state) => { state.alert = {} },
        clearSearchResults: (state) => { state.searchResults = [] },
    },
})

export const { clearAlert, clearSearchResults } = budgetSlice.actions

export default budgetSlice.reducer
