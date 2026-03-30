import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { main, dark, light } from '../../style'
import styles from '../../style'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faWallet, faChartPie, faCalendarDay, faCalendarAlt, faTags, faPlus, faMinus,
    faTrash, faPen, faCheck, faTimes, faArrowUp, faArrowDown, faEllipsisH,
    faMoneyBillWave, faCreditCard, faMobileAlt, faUniversity, faCoins,
    faExclamationTriangle, faCheckCircle, faArrowRight, faSyncAlt, faFileExport, faFilter, faPiggyBank, faHistory, faFilePdf,
    faHandHoldingUsd, faUserFriends, faCalendarCheck, faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons'
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'
import { 
    getBudgetDashboard, getBudgetCategories, createBudgetCategory, updateBudgetCategory, 
    deleteBudgetCategory, getBudgetExpenses, createBudgetExpense, updateBudgetExpense, 
    deleteBudgetExpense, bulkDeleteBudgetExpenses, bulkUpdateBudgetCategory,
    getBudgetSavings, saveBudgetSavings, getBudgetSavingsHistory, deleteBudgetSavingsHistory,
    getDebts, createDebt, updateDebt, deleteDebt, addDebtPayment, removeDebtPayment, toggleDebtStatus,
    clearAlert 
} from '../../actions/budget'
import Notification from '../Custom/Notification'

const PAYMENT_METHODS = ['Cash', 'GCash', 'Bank', 'BPI', 'Credit Card', 'Debit Card', 'PayPal', 'Other']
const CATEGORY_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const VALID_TABS = ['dashboard', 'daily', 'monthly', 'categories', 'savings', 'debts', 'summary']

const Budget = ({ user, theme }) => {
    const dispatch = useDispatch()
    const { dashboard, categories, expenses, savings, savingsHistory, debts, alert: budgetAlert, isLoading } = useSelector(state => state.budget)
    const [searchParams, setSearchParams] = useSearchParams()

    const isLight = theme === 'light'
    const now = new Date()

    const tabParam = searchParams.get('tab')
    const [activeTab, setActiveTabState] = useState(VALID_TABS.includes(tabParam) ? tabParam : 'dashboard')
    const setActiveTab = (tab) => {
        setActiveTabState(tab)
        setSearchParams({ tab }, { replace: true })
    }
    const [month, setMonth] = useState(now.getMonth() + 1)
    const [year, setYear] = useState(now.getFullYear())
    const [notification, setNotification] = useState({})
    const [showNotif, setShowNotif] = useState(true)

    // expense form
    const emptyItem = { description: '', amount: '' }
    const emptyExpense = { date: new Date().toISOString().split('T')[0], category: '', type: 'expense', paymentMethod: 'Cash', notes: '' }
    const [expenseForm, setExpenseForm] = useState(emptyExpense)
    const [expenseItems, setExpenseItems] = useState([{ ...emptyItem }])
    const [editingExpense, setEditingExpense] = useState(null)
    const [showExpenseForm, setShowExpenseForm] = useState(false)

    // category form
    const emptyCategory = { name: '', color: '#3b82f6', type: 'expense', budget: '' }
    const [categoryForm, setCategoryForm] = useState(emptyCategory)
    const [editingCategory, setEditingCategory] = useState(null)
    const [showCategoryForm, setShowCategoryForm] = useState(false)

    // delete confirm
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    // bulk selection
    const [selectedExpenses, setSelectedExpenses] = useState([])
    const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

    useEffect(() => {
        if (user) {
            dispatch(getBudgetCategories())
            dispatch(getBudgetDashboard({ month, year }))
            dispatch(getBudgetExpenses({ month, year }))
        }
    }, [user])

    useEffect(() => {
        if (user) {
            dispatch(getBudgetDashboard({ month, year }))
            dispatch(getBudgetExpenses({ month, year }))
        }
    }, [month, year])

    useEffect(() => {
        if (budgetAlert && Object.keys(budgetAlert).length > 0) {
            setNotification(budgetAlert)
            setShowNotif(true)
            dispatch(clearAlert())
        }
    }, [budgetAlert])

    useEffect(() => {
        if (!showNotif) setNotification({})
    }, [showNotif])

    const refreshData = () => {
        dispatch(getBudgetDashboard({ month, year }))
        dispatch(getBudgetExpenses({ month, year }))
        dispatch(getBudgetCategories())
    }

    // ==================== HANDLERS ====================

    const handleExpenseSubmit = async () => {
        if (editingExpense) {
            const item = expenseItems[0]
            if (!item?.description || !item?.amount) return
            await dispatch(updateBudgetExpense({ ...expenseForm, description: item.description, amount: parseFloat(item.amount), id: editingExpense, month, year }))
        } else {
            const validItems = expenseItems.filter(i => i.description && i.amount)
            if (validItems.length === 0) return
            await dispatch(createBudgetExpense({ ...expenseForm, items: validItems, month, year }))
        }
        setExpenseForm(emptyExpense)
        setExpenseItems([{ ...emptyItem }])
        setEditingExpense(null)
        setShowExpenseForm(false)
        dispatch(getBudgetDashboard({ month, year }))
    }

    const handleEditExpense = (e) => {
        setExpenseForm({
            date: new Date(e.date).toISOString().split('T')[0],
            category: e.category?._id || '',
            type: e.type,
            paymentMethod: e.paymentMethod,
            notes: e.notes || ''
        })
        setExpenseItems([{ description: e.description, amount: e.amount.toString() }])
        setEditingExpense(e._id)
        setShowExpenseForm(true)
    }

    const handleDeleteExpense = async (id) => {
        if (deleteConfirm === id) {
            await dispatch(deleteBudgetExpense(id))
            dispatch(getBudgetExpenses({ month, year }))
            dispatch(getBudgetDashboard({ month, year }))
            setDeleteConfirm(null)
        } else {
            setDeleteConfirm(id)
            setTimeout(() => setDeleteConfirm(null), 3000)
        }
    }

    const handleBulkDelete = async () => {
        if (!bulkDeleteConfirm) {
            setBulkDeleteConfirm(true)
            setTimeout(() => setBulkDeleteConfirm(false), 3000)
            return
        }
        await dispatch(bulkDeleteBudgetExpenses({ ids: selectedExpenses, month, year }))
        setSelectedExpenses([])
        setBulkDeleteConfirm(false)
        dispatch(getBudgetDashboard({ month, year }))
    }

    const handleBulkCategoryUpdate = async (categoryId) => {
        await dispatch(bulkUpdateBudgetCategory({ ids: selectedExpenses, category: categoryId, month, year }))
        setSelectedExpenses([])
        dispatch(getBudgetDashboard({ month, year }))
    }

    const toggleSelectExpense = (id) => {
        setSelectedExpenses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const toggleSelectAll = () => {
        const allIds = expenses.map(e => e._id)
        if (selectedExpenses.length === allIds.length) setSelectedExpenses([])
        else setSelectedExpenses(allIds)
    }

    const handleCategorySubmit = async () => {
        if (!categoryForm.name) return
        const data = { ...categoryForm, budget: parseFloat(categoryForm.budget) || 0 }
        if (editingCategory) {
            await dispatch(updateBudgetCategory({ ...data, id: editingCategory }))
        } else {
            await dispatch(createBudgetCategory(data))
        }
        setCategoryForm(emptyCategory)
        setEditingCategory(null)
        setShowCategoryForm(false)
        dispatch(getBudgetDashboard({ month, year }))
    }

    const handleEditCategory = (c) => {
        setCategoryForm({ name: c.name, color: c.color, type: c.type, budget: c.budget?.toString() || '' })
        setEditingCategory(c._id)
        setShowCategoryForm(true)
    }

    const handleDeleteCategory = async (id) => {
        if (deleteConfirm === id) {
            await dispatch(deleteBudgetCategory(id))
            dispatch(getBudgetDashboard({ month, year }))
            setDeleteConfirm(null)
        } else {
            setDeleteConfirm(id)
            setTimeout(() => setDeleteConfirm(null), 3000)
        }
    }

    const handleExportCSV = () => {
        if (!expenses.length) return
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Type', 'Payment Method', 'Notes']
        const rows = expenses.map(e => [
            new Date(e.date).toLocaleDateString('en-US'),
            `"${(e.description || '').replace(/"/g, '""')}"`,
            e.category?.name || 'Uncategorized',
            e.amount,
            e.type,
            e.paymentMethod,
            `"${(e.notes || '').replace(/"/g, '""')}"`
        ])
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `budget_${MONTHS[month - 1]}_${year}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const prevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1) }
        else setMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1) }
        else setMonth(m => m + 1)
    }

    // ==================== GROUPED EXPENSES ====================

    const groupedByDate = useMemo(() => {
        const groups = {}
        expenses.forEach(e => {
            const d = new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            if (!groups[d]) groups[d] = { items: [], totalIncome: 0, totalExpense: 0 }
            groups[d].items.push(e)
            if (e.type === 'income') groups[d].totalIncome += e.amount
            else groups[d].totalExpense += e.amount
        })
        return Object.entries(groups)
    }, [expenses])

    // ==================== MONTHLY BUDGET DATA ====================

    const monthlyBudgetData = useMemo(() => {
        const expenseCats = categories.filter(c => c.type === 'expense')
        return expenseCats.map(cat => {
            const spent = expenses.filter(e => e.category?._id === cat._id && e.type === 'expense').reduce((s, e) => s + e.amount, 0)
            const pct = cat.budget > 0 ? Math.round((spent / cat.budget) * 100) : 0
            return { ...cat, spent, remaining: cat.budget - spent, percentage: pct }
        })
    }, [categories, expenses])

    // ==================== SHARED STYLES ====================

    const card = `rounded-xl border border-solid ${isLight ? 'bg-white/90 backdrop-blur-sm border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`
    const inputCls = `w-full px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const selectCls = `px-3 py-2 rounded-lg text-sm border border-solid outline-none transition-all cursor-pointer ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`
    const btnPrimary = `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`
    const btnSecondary = `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300'}`

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: faChartPie },
        { id: 'daily', label: 'Daily Expenses', icon: faCalendarDay },
        { id: 'monthly', label: 'Monthly Budget', icon: faCalendarAlt },
        { id: 'categories', label: 'Categories', icon: faTags },
        { id: 'savings', label: 'Savings', icon: faPiggyBank },
        { id: 'debts', label: 'Debts', icon: faHandHoldingUsd },
        { id: 'summary', label: 'Summary', icon: faFilePdf },
    ]

    const paymentIcon = (m) => {
        switch(m) {
            case 'GCash': return faMobileAlt
            case 'Bank': return faUniversity
            case 'Credit Card': case 'Debit Card': return faCreditCard
            case 'PayPal': return faCoins
            default: return faMoneyBillWave
        }
    }

    const formatCurrency = (v) => `₱${(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    const statusColor = (pct) => {
        if (pct >= 100) return { bg: isLight ? 'bg-red-50' : 'bg-red-900/20', text: 'text-red-500', bar: 'bg-red-500', border: isLight ? 'border-red-200' : 'border-red-800/50' }
        if (pct >= 80) return { bg: isLight ? 'bg-amber-50' : 'bg-amber-900/20', text: 'text-amber-500', bar: 'bg-amber-500', border: isLight ? 'border-amber-200' : 'border-amber-800/50' }
        return { bg: isLight ? 'bg-emerald-50' : 'bg-emerald-900/20', text: 'text-emerald-500', bar: 'bg-emerald-500', border: isLight ? 'border-emerald-200' : 'border-emerald-800/50' }
    }

    if (!user) {
        return (
            <div className={`relative overflow-hidden ${main.font} ${isLight ? light.body : dark.body}`}>
                <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                    <div className={`${styles.boxWidthEx}`}>
                        <div className="flex items-center justify-center py-32">
                            <div className={`text-center ${card} p-8`}>
                                <FontAwesomeIcon icon={faWallet} className={`text-4xl mb-4 ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                                <h2 className={`text-lg font-semibold mb-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>Login Required</h2>
                                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Please log in to access the budget system.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative overflow-hidden ${main.font} ${isLight ? light.body : dark.body}`}>
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidthEx}`}>
                    <div className="relative px-0 my-6 sm:my-12">

                        <Notification theme={theme} data={notification} show={showNotif} setShow={setShowNotif} />

                        {/* Header */}
                        <div className={`${card} p-4 sm:p-6 mb-4`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                                        <FontAwesomeIcon icon={faWallet} className={`text-base sm:text-lg ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                                    </div>
                                    <div>
                                        <h1 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Budget Manager</h1>
                                        <p className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Track your income and expenses</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={prevMonth} disabled={isLoading} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faArrowRight} className="text-xs rotate-180" />
                                    </button>
                                    <span className={`text-xs sm:text-sm font-semibold min-w-[120px] sm:min-w-[140px] text-center ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                        {MONTHS[month - 1]} {year}
                                    </span>
                                    <button onClick={nextMonth} disabled={isLoading} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`}>
                                        <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                                    </button>
                                    <button onClick={refreshData} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#1f1f1f] text-gray-400'}`} title="Refresh">
                                        <FontAwesomeIcon icon={faSyncAlt} className={`text-xs ${isLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                    {expenses.length > 0 && (
                                        <button onClick={handleExportCSV} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isLight ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`} title="Export to CSV">
                                            <FontAwesomeIcon icon={faFileExport} className="text-[10px]" />
                                            <span className="hidden sm:inline">Export</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                                            activeTab === tab.id
                                                ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white')
                                                : (isLight ? 'text-slate-500 hover:bg-slate-50' : 'text-gray-400 hover:bg-[#1a1a1a]')
                                        }`}
                                    >
                                        <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'dashboard' && <DashboardTab dashboard={dashboard} isLight={isLight} card={card} formatCurrency={formatCurrency} statusColor={statusColor} isLoading={isLoading} />}
                        {activeTab === 'daily' && (
                            <DailyExpensesTab
                                groupedByDate={groupedByDate} categories={categories} expenses={expenses}
                                expenseForm={expenseForm} setExpenseForm={setExpenseForm} editingExpense={editingExpense}
                                expenseItems={expenseItems} setExpenseItems={setExpenseItems} emptyItem={emptyItem}
                                showExpenseForm={showExpenseForm} setShowExpenseForm={setShowExpenseForm}
                                handleExpenseSubmit={handleExpenseSubmit} handleEditExpense={handleEditExpense}
                                handleDeleteExpense={handleDeleteExpense} setEditingExpense={setEditingExpense}
                                deleteConfirm={deleteConfirm} isLight={isLight} card={card} inputCls={inputCls}
                                selectCls={selectCls} btnPrimary={btnPrimary} btnSecondary={btnSecondary}
                                formatCurrency={formatCurrency} paymentIcon={paymentIcon}
                                emptyExpense={emptyExpense} isLoading={isLoading}
                                selectedExpenses={selectedExpenses} toggleSelectExpense={toggleSelectExpense}
                                toggleSelectAll={toggleSelectAll} handleBulkDelete={handleBulkDelete}
                                bulkDeleteConfirm={bulkDeleteConfirm} setSelectedExpenses={setSelectedExpenses}
                                setBulkDeleteConfirm={setBulkDeleteConfirm}
                                handleBulkCategoryUpdate={handleBulkCategoryUpdate}
                            />
                        )}
                        {activeTab === 'monthly' && (
                            <MonthlyBudgetTab
                                monthlyBudgetData={monthlyBudgetData} dashboard={dashboard}
                                isLight={isLight} card={card} formatCurrency={formatCurrency} statusColor={statusColor}
                                month={month} year={year} isLoading={isLoading}
                            />
                        )}
                        {activeTab === 'categories' && (
                            <CategoriesTab
                                categories={categories} categoryForm={categoryForm} setCategoryForm={setCategoryForm}
                                editingCategory={editingCategory} showCategoryForm={showCategoryForm}
                                setShowCategoryForm={setShowCategoryForm} handleCategorySubmit={handleCategorySubmit}
                                handleEditCategory={handleEditCategory} handleDeleteCategory={handleDeleteCategory}
                                setEditingCategory={setEditingCategory} deleteConfirm={deleteConfirm}
                                isLight={isLight} card={card} inputCls={inputCls} selectCls={selectCls}
                                btnPrimary={btnPrimary} btnSecondary={btnSecondary} formatCurrency={formatCurrency}
                                emptyCategory={emptyCategory} isLoading={isLoading}
                            />
                        )}
                        {activeTab === 'savings' && (
                            <SavingsTab isLight={isLight} card={card} inputCls={inputCls} formatCurrency={formatCurrency} dispatch={dispatch} savings={savings} savingsHistory={savingsHistory} isLoading={isLoading} />
                        )}
                        {activeTab === 'debts' && (
                            <DebtTab
                                debts={debts} categories={categories} dispatch={dispatch} isLight={isLight} card={card}
                                inputCls={inputCls} selectCls={selectCls} btnPrimary={btnPrimary}
                                btnSecondary={btnSecondary} formatCurrency={formatCurrency} isLoading={isLoading}
                            />
                        )}
                        {activeTab === 'summary' && (
                            <SummaryTab
                                dashboard={dashboard} expenses={expenses} categories={categories}
                                monthlyBudgetData={monthlyBudgetData} groupedByDate={groupedByDate}
                                month={month} year={year} isLight={isLight} card={card}
                                formatCurrency={formatCurrency} statusColor={statusColor}
                                paymentIcon={paymentIcon} isLoading={isLoading}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ==================== DASHBOARD TAB ====================

const DashboardTab = ({ dashboard, isLight, card, formatCurrency, statusColor, isLoading }) => {
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`

    if (isLoading || !dashboard) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`${card} p-5`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`h-3 w-20 ${pulse}`} />
                                <div className={`w-8 h-8 rounded-lg ${pulse}`} />
                            </div>
                            <div className={`h-6 w-28 ${pulse}`} />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className={`${card} p-5`}>
                            <div className={`h-4 w-40 mb-4 ${pulse}`} />
                            <div className="space-y-3">
                                {[...Array(4)].map((_, j) => (
                                    <div key={j}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className={`h-3 w-24 ${pulse}`} />
                                            <div className={`h-3 w-16 ${pulse}`} />
                                        </div>
                                        <div className={`h-1.5 rounded-full ${pulse}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={`${card} p-5`}>
                    <div className={`h-4 w-32 mb-4 ${pulse}`} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="text-center">
                                <div className={`h-7 w-20 mx-auto ${pulse}`} />
                                <div className={`h-3 w-16 mx-auto mt-2 ${pulse}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const d = dashboard
    const balancePositive = d.balance >= 0

    const summaryCards = [
        { label: 'Total Income', value: formatCurrency(d.totalIncome), icon: faArrowUp, color: 'emerald' },
        { label: 'Total Expenses', value: formatCurrency(d.totalExpenses), icon: faArrowDown, color: 'red' },
        { label: 'Balance', value: formatCurrency(d.balance), icon: faWallet, color: balancePositive ? 'blue' : 'red' },
        { label: 'Remaining Budget', value: formatCurrency(d.remainingBudget), icon: faChartPie, color: d.remainingBudget >= 0 ? 'emerald' : 'red' },
    ]

    const colorMap = {
        emerald: { icon: isLight ? 'text-emerald-600' : 'text-emerald-400', bg: isLight ? 'bg-emerald-50' : 'bg-emerald-900/20' },
        red: { icon: isLight ? 'text-red-600' : 'text-red-400', bg: isLight ? 'bg-red-50' : 'bg-red-900/20' },
        blue: { icon: isLight ? 'text-blue-600' : 'text-blue-400', bg: isLight ? 'bg-blue-50' : 'bg-blue-900/20' },
    }

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((s, i) => {
                    const cm = colorMap[s.color]
                    return (
                        <div key={i} className={`${card} p-5`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-xs font-medium uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{s.label}</span>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cm.bg}`}>
                                    <FontAwesomeIcon icon={s.icon} className={`text-sm ${cm.icon}`} />
                                </div>
                            </div>
                            <p className={`text-lg sm:text-xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{s.value}</p>
                        </div>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Categories */}
                <div className={`${card} p-5`}>
                    <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Top Spending Categories</h3>
                    {d.topCategories?.length > 0 ? (
                        <div className="space-y-3">
                            {d.topCategories.map((cat, i) => {
                                const pct = d.totalExpenses > 0 ? Math.round((cat.amount / d.totalExpenses) * 100) : 0
                                return (
                                    <div key={i}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                                <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(cat.amount)}</span>
                                                <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{pct}%</span>
                                            </div>
                                        </div>
                                        <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No spending data this month.</p>
                    )}
                </div>

                {/* Payment Methods */}
                <div className={`${card} p-5`}>
                    <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Payment Methods</h3>
                    {d.paymentMethodTotals && Object.keys(d.paymentMethodTotals).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(d.paymentMethodTotals).sort((a, b) => b[1] - a[1]).map(([method, amount]) => (
                                <div key={method} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                            <FontAwesomeIcon icon={
                                                method === 'GCash' ? faMobileAlt : 
                                                method === 'Bank' ? faUniversity : 
                                                ['Credit Card', 'Debit Card'].includes(method) ? faCreditCard : 
                                                faMoneyBillWave
                                            } className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`} />
                                        </div>
                                        <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{method}</span>
                                    </div>
                                    <span className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(amount)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No payments recorded this month.</p>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className={`${card} p-5`}>
                <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Monthly Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center">
                        <p className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{d.transactionCount}</p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Transactions</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{formatCurrency(d.totalBudget)}</p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Total Budget</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-xl sm:text-2xl font-bold ${d.totalBudget > 0 ? (d.totalExpenses / d.totalBudget > 1 ? 'text-red-500' : d.totalExpenses / d.totalBudget > 0.8 ? 'text-amber-500' : 'text-emerald-500') : (isLight ? 'text-slate-800' : 'text-white')}`}>
                            {d.totalBudget > 0 ? `${Math.round((d.totalExpenses / d.totalBudget) * 100)}%` : '—'}
                        </p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Budget Used</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            {d.transactionCount > 0 ? formatCurrency(d.totalExpenses / (new Date(d.year, d.month, 0).getDate())) : '—'}
                        </p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Daily Average</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ==================== DAILY EXPENSES TAB ====================

const DailyExpensesTab = ({
    groupedByDate, categories, expenses, expenseForm, setExpenseForm, editingExpense,
    expenseItems, setExpenseItems, emptyItem,
    showExpenseForm, setShowExpenseForm, handleExpenseSubmit, handleEditExpense,
    handleDeleteExpense, setEditingExpense, deleteConfirm, isLight, card, inputCls,
    selectCls, btnPrimary, btnSecondary, formatCurrency, paymentIcon, emptyExpense, isLoading,
    selectedExpenses, toggleSelectExpense, toggleSelectAll, handleBulkDelete,
    bulkDeleteConfirm, setSelectedExpenses, setBulkDeleteConfirm,
    handleBulkCategoryUpdate
}) => {
    const [filterDate, setFilterDate] = useState('')
    const [filterMethod, setFilterMethod] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    const hasFilters = filterDate || filterMethod || filterCategory

    const filtered = useMemo(() => {
        let list = expenses
        if (filterDate) list = list.filter(e => new Date(e.date).toISOString().split('T')[0] === filterDate)
        if (filterMethod) list = list.filter(e => e.paymentMethod === filterMethod)
        if (filterCategory) {
            if (filterCategory === 'uncategorized') list = list.filter(e => !e.category)
            else list = list.filter(e => e.category?._id === filterCategory)
        }
        return list
    }, [expenses, filterDate, filterMethod, filterCategory])

    const filteredGrouped = useMemo(() => {
        const groups = {}
        filtered.forEach(e => {
            const d = new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
            if (!groups[d]) groups[d] = { items: [], totalIncome: 0, totalExpense: 0 }
            groups[d].items.push(e)
            if (e.type === 'income') groups[d].totalIncome += e.amount
            else groups[d].totalExpense += e.amount
        })
        return Object.entries(groups)
    }, [filtered])

    const allSelected = filtered.length > 0 && selectedExpenses.length === filtered.length
    const someSelected = selectedExpenses.length > 0

    const totalIncome = filtered.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
    const totalExpense = filtered.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)

    const clearFilters = () => { setFilterDate(''); setFilterMethod(''); setFilterCategory('') }

    const usedMethods = [...new Set(expenses.map(e => e.paymentMethod))].sort()
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className={`${card} p-4`}>
                    <div className="flex items-center justify-between">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="text-center flex-1">
                                <div className={`h-3 w-16 mx-auto mb-2 ${pulse}`} />
                                <div className={`h-5 w-20 mx-auto ${pulse}`} />
                            </div>
                        ))}
                    </div>
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`${card} overflow-hidden`}>
                        <div className={`px-4 py-3 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            <div className={`h-4 w-36 ${pulse}`} />
                        </div>
                        <div className="divide-y divide-solid" style={{ borderColor: isLight ? '#f1f5f9' : '#1f1f1f' }}>
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="flex items-center gap-3 px-4 py-3">
                                    <div className={`w-8 h-8 rounded-lg ${pulse}`} />
                                    <div className="flex-1 space-y-1.5">
                                        <div className={`h-3.5 w-32 ${pulse}`} />
                                        <div className={`h-2.5 w-20 ${pulse}`} />
                                    </div>
                                    <div className={`h-4 w-16 ${pulse}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className={`${card} px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                        <FontAwesomeIcon icon={faCalendarDay} className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1 flex items-center justify-between sm:block">
                        <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Entries</p>
                        <p className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{filtered.length}{hasFilters ? ` / ${expenses.length}` : ''}</p>
                    </div>
                </div>
                <div className={`${card} px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-emerald-50' : 'bg-emerald-900/20'}`}>
                        <FontAwesomeIcon icon={faArrowUp} className="text-xs text-emerald-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-between sm:block">
                        <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Income</p>
                        <p className="text-sm font-bold text-emerald-500">{formatCurrency(totalIncome)}</p>
                    </div>
                </div>
                <div className={`${card} px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-red-50' : 'bg-red-900/20'}`}>
                        <FontAwesomeIcon icon={faArrowDown} className="text-xs text-red-500" />
                    </div>
                    <div className="flex-1 flex items-center justify-between sm:block">
                        <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Expenses</p>
                        <p className="text-sm font-bold text-red-500">{formatCurrency(totalExpense)}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={`${card} overflow-hidden`}>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 transition-all ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#111]'}`}
                >
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} className={`text-[10px] ${hasFilters ? (isLight ? 'text-blue-500' : 'text-blue-400') : (isLight ? 'text-slate-400' : 'text-gray-500')}`} />
                        <span className={`text-xs font-medium ${hasFilters ? (isLight ? 'text-blue-600' : 'text-blue-400') : (isLight ? 'text-slate-500' : 'text-gray-400')}`}>
                            {hasFilters ? 'Filters active' : 'Filter'}
                        </span>
                        {hasFilters && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>
                                {[filterDate, filterMethod, filterCategory].filter(Boolean).length}
                            </span>
                        )}
                    </div>
                    {hasFilters && (
                        <span
                            onClick={e => { e.stopPropagation(); clearFilters() }}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md cursor-pointer transition-all ${isLight ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'}`}
                        >
                            Clear all
                        </span>
                    )}
                </button>
                {showFilters && (
                    <div className={`px-4 py-3 border-t border-solid ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#0a0a0a]'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Date</label>
                                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Payment Method</label>
                                <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} className={`${selectCls} w-full`}>
                                    <option value="">All Methods</option>
                                    {usedMethods.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-[11px] font-medium mb-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Category</label>
                                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={`${selectCls} w-full`}>
                                    <option value="">All Categories</option>
                                    <option value="uncategorized">Uncategorized</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Action Bar */}
            {someSelected && (
                <div className={`rounded-xl p-3 border border-solid ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111] border-[#2B2B2B]'}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4 rounded cursor-pointer accent-blue-500" />
                            <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{selectedExpenses.length} selected</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[11px] font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Move to:</span>
                                <select
                                    defaultValue=""
                                    onChange={e => { if (e.target.value !== '') handleBulkCategoryUpdate(e.target.value === 'none' ? '' : e.target.value); e.target.value = '' }}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs border border-solid outline-none cursor-pointer ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1a1a1a] border-[#333] text-gray-300'}`}
                                >
                                    <option value="" disabled>Select category</option>
                                    <option value="none">Uncategorized</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className={`w-px h-5 ${isLight ? 'bg-slate-200' : 'bg-[#333]'}`} />
                            <button onClick={() => { setSelectedExpenses([]); setBulkDeleteConfirm(false) }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-white hover:bg-slate-100 text-slate-600 border border-solid border-slate-200' : 'bg-[#1a1a1a] hover:bg-[#222] text-gray-300 border border-solid border-[#333]'}`}>Cancel</button>
                            <button onClick={handleBulkDelete} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${bulkDeleteConfirm ? 'bg-red-600 hover:bg-red-700 text-white' : (isLight ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white')}`}>
                                <FontAwesomeIcon icon={bulkDeleteConfirm ? faExclamationTriangle : faTrash} className="text-[10px]" />
                                {bulkDeleteConfirm ? 'Confirm Delete' : `Delete (${selectedExpenses.length})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Transaction Form */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                        {editingExpense ? 'Edit Transaction' : 'Transactions'}
                    </h3>
                    <button
                        onClick={() => { setShowExpenseForm(!showExpenseForm); setEditingExpense(null); setExpenseForm(emptyExpense); setExpenseItems([{ ...emptyItem }]) }}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                            showExpenseForm
                                ? (isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1f1f1f] text-gray-400')
                                : (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                        }`}
                    >
                        <FontAwesomeIcon icon={showExpenseForm ? faTimes : faPlus} className="text-[10px]" />
                        {showExpenseForm ? 'Cancel' : 'Add New'}
                    </button>
                </div>

                {showExpenseForm && (
                    <div className={`px-4 sm:px-5 py-4 border-b border-solid ${isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-[#111] border-[#1f1f1f]'}`}>
                        {/* Shared fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Date</label>
                                <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className={inputCls} />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Type</label>
                                <select value={expenseForm.type} onChange={e => setExpenseForm({...expenseForm, type: e.target.value, category: ''})} className={`${selectCls} w-full`}>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Category</label>
                                <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className={`${selectCls} w-full`}>
                                    <option value="">None</option>
                                    {categories.filter(c => c.type === expenseForm.type).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Payment Method</label>
                                <select value={expenseForm.paymentMethod} onChange={e => setExpenseForm({...expenseForm, paymentMethod: e.target.value})} className={`${selectCls} w-full`}>
                                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Items list */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                    Items ({expenseItems.length})
                                </label>
                                {!editingExpense && (
                                    <button
                                        onClick={() => setExpenseItems([...expenseItems, { ...emptyItem }])}
                                        className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-all ${isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-blue-400 hover:bg-blue-900/20'}`}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="text-[8px]" />
                                        Add Item
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {expenseItems.map((item, idx) => (
                                    <div key={idx} className={`flex items-center gap-2 p-2.5 rounded-lg border border-solid ${isLight ? 'bg-white border-slate-200/80' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
                                        <span className={`text-[10px] font-bold w-5 text-center flex-shrink-0 ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>{idx + 1}</span>
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={e => {
                                                    const updated = [...expenseItems]
                                                    updated[idx] = { ...updated[idx], description: e.target.value }
                                                    setExpenseItems(updated)
                                                }}
                                                className={inputCls}
                                            />
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={item.amount}
                                                onChange={e => {
                                                    const updated = [...expenseItems]
                                                    updated[idx] = { ...updated[idx], amount: e.target.value }
                                                    setExpenseItems(updated)
                                                }}
                                                className={inputCls}
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        {expenseItems.length > 1 && (
                                            <button
                                                onClick={() => setExpenseItems(expenseItems.filter((_, i) => i !== idx))}
                                                className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${isLight ? 'hover:bg-red-50 text-red-400' : 'hover:bg-red-900/20 text-red-500'}`}
                                            >
                                                <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {expenseItems.length > 1 && (
                                <div className={`flex items-center justify-end mt-2 pt-2 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    <span className={`text-xs font-medium mr-2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Total:</span>
                                    <span className={`text-sm font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                        {formatCurrency(expenseItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0))}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-3">
                            <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Notes (optional)</label>
                            <input type="text" placeholder="Additional notes..." value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} className={inputCls} />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => { setShowExpenseForm(false); setEditingExpense(null); setExpenseForm(emptyExpense); setExpenseItems([{ ...emptyItem }]) }} className={btnSecondary}>Cancel</button>
                            <button onClick={handleExpenseSubmit} className={btnPrimary} disabled={!expenseItems.some(i => i.description && i.amount)}>
                                <FontAwesomeIcon icon={editingExpense ? faCheck : faPlus} className="mr-1.5 text-xs" />
                                {editingExpense ? 'Update' : `Add ${expenseItems.filter(i => i.description && i.amount).length > 1 ? `(${expenseItems.filter(i => i.description && i.amount).length} items)` : ''}`}
                            </button>
                        </div>
                    </div>
                )}

                {/* Table */}
                {filtered.length > 0 ? (
                    <div className="overflow-x-auto -mx-px">
                        <table className="w-full min-w-[640px]">
                            <thead>
                                <tr className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400 bg-slate-50/80' : 'text-gray-500 bg-[#111]'}`}>
                                    <th className="w-10 px-4 py-2.5 text-center">
                                        <input type="checkbox" checked={allSelected} onChange={() => {
                                            const filteredIds = filtered.map(e => e._id)
                                            if (allSelected) setSelectedExpenses(prev => prev.filter(id => !filteredIds.includes(id)))
                                            else setSelectedExpenses(prev => [...new Set([...prev, ...filteredIds])])
                                        }} className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500" />
                                    </th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Date</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Description</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Category</th>
                                    <th className="px-3 py-2.5 text-left font-semibold">Method</th>
                                    <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
                                    <th className="w-20 px-3 py-2.5 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGrouped.map(([date, group]) => {
                                    const groupIds = group.items.map(e => e._id)
                                    const allGroupSelected = groupIds.every(id => selectedExpenses.includes(id))
                                    return (
                                        <React.Fragment key={date}>
                                            {/* Date separator row */}
                                            <tr className={isLight ? 'bg-slate-50/50' : 'bg-[#0a0a0a]'}>
                                                <td className="px-4 py-2 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={allGroupSelected}
                                                        onChange={() => {
                                                            if (allGroupSelected) setSelectedExpenses(prev => prev.filter(id => !groupIds.includes(id)))
                                                            else setSelectedExpenses(prev => [...new Set([...prev, ...groupIds])])
                                                        }}
                                                        className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500"
                                                    />
                                                </td>
                                                <td colSpan={4} className="px-3 py-2">
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{date}</span>
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {group.totalIncome > 0 && <span className="text-[11px] font-semibold text-emerald-500">+{formatCurrency(group.totalIncome)}</span>}
                                                        {group.totalExpense > 0 && <span className="text-[11px] font-semibold text-red-500">-{formatCurrency(group.totalExpense)}</span>}
                                                    </div>
                                                </td>
                                                <td />
                                            </tr>
                                            {/* Expense rows */}
                                            {group.items.map(e => {
                                                const isSelected = selectedExpenses.includes(e._id)
                                                return (
                                                    <tr
                                                        key={e._id}
                                                        className={`group transition-colors ${isSelected ? (isLight ? 'bg-blue-50/60' : 'bg-blue-900/10') : (isLight ? 'hover:bg-slate-50/50' : 'hover:bg-[#111]')} border-b border-solid ${isLight ? 'border-slate-50' : 'border-[#1a1a1a]'}`}
                                                    >
                                                        <td className="px-4 py-2.5 text-center">
                                                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelectExpense(e._id)} className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500" />
                                                        </td>
                                                        <td className={`px-3 py-2.5 text-xs whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                            {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <p className={`text-sm font-medium truncate max-w-[200px] ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{e.description}</p>
                                                            {e.notes && <p className={`text-[11px] truncate max-w-[200px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{e.notes}</p>}
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.category?.color || '#94a3b8' }} />
                                                                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{e.category?.name || 'Uncategorized'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#1a1a1a] text-gray-400'}`}>
                                                                <FontAwesomeIcon icon={paymentIcon(e.paymentMethod)} className="text-[9px]" />
                                                                {e.paymentMethod}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right">
                                                            <span className={`text-sm font-semibold whitespace-nowrap ${e.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount)}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right">
                                                            <div className="flex items-center justify-end gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleEditExpense(e)} className={`w-7 h-7 rounded-md flex items-center justify-center ${isLight ? 'hover:bg-blue-100 text-blue-500' : 'hover:bg-blue-900/30 text-blue-400'}`}>
                                                                    <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                                                </button>
                                                                <button onClick={() => handleDeleteExpense(e._id)} className={`w-7 h-7 rounded-md flex items-center justify-center ${deleteConfirm === e._id ? (isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400') : (isLight ? 'hover:bg-red-100 text-red-500' : 'hover:bg-red-900/30 text-red-400')}`}>
                                                                    <FontAwesomeIcon icon={deleteConfirm === e._id ? faExclamationTriangle : faTrash} className="text-[10px]" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </React.Fragment>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-16 px-5">
                        <FontAwesomeIcon icon={hasFilters ? faFilter : faCalendarDay} className={`text-3xl mb-3 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{hasFilters ? 'No transactions match your filters.' : 'No transactions this month.'}</p>
                        <p className={`text-xs mt-1 ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>{hasFilters ? <span className="cursor-pointer hover:underline" onClick={clearFilters}>Clear filters</span> : 'Click "Add New" to get started.'}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ==================== MONTHLY BUDGET TAB ====================

const MonthlyBudgetTab = ({ monthlyBudgetData, dashboard, isLight, card, formatCurrency, statusColor, month, year, isLoading }) => {
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`

    if (isLoading || !dashboard) {
        return (
            <div className="space-y-4">
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`h-4 w-32 ${pulse}`} />
                        <div className={`h-4 w-24 ${pulse}`} />
                    </div>
                    <div className={`h-3 rounded-full w-full ${pulse}`} />
                    <div className="flex justify-between mt-2">
                        <div className={`h-3 w-20 ${pulse}`} />
                        <div className={`h-3 w-20 ${pulse}`} />
                    </div>
                </div>
                <div className={`${card} overflow-hidden`}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`flex items-center gap-3 px-5 py-4 ${i > 0 ? `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}` : ''}`}>
                            <div className={`w-3 h-3 rounded-full ${pulse}`} />
                            <div className="flex-1 space-y-1.5">
                                <div className={`h-3.5 w-28 ${pulse}`} />
                                <div className={`h-2 rounded-full w-full ${pulse}`} />
                            </div>
                            <div className={`h-4 w-20 ${pulse}`} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const totalBudget = dashboard?.totalBudget || 0
    const totalSpent = dashboard?.totalExpenses || 0
    const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    const overallStatus = statusColor(overallPct)

    return (
        <div className="space-y-4">
            {/* Overall Budget Bar */}
            <div className={`${card} p-5`}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                        {MONTHS[month - 1]} {year} — Overall Budget
                    </h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${overallStatus.text} ${overallStatus.bg}`}>
                        {overallPct}%
                    </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                    <div className={`h-full rounded-full transition-all duration-700 ${overallStatus.bar}`} style={{ width: `${Math.min(overallPct, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Spent: {formatCurrency(totalSpent)}</span>
                    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Budget: {formatCurrency(totalBudget)}</span>
                </div>
            </div>

            {/* Per Category */}
            {monthlyBudgetData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {monthlyBudgetData.map(cat => {
                        const sc = statusColor(cat.percentage)
                        return (
                            <div key={cat._id} className={`${card} p-4 border-l-4`} style={{ borderLeftColor: cat.color }}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span className={`text-sm font-medium ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{cat.name}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc.text} ${sc.bg}`}>
                                        {cat.budget > 0 ? `${cat.percentage}%` : 'No budget'}
                                    </span>
                                </div>
                                {cat.budget > 0 && (
                                    <div className={`h-2 rounded-full overflow-hidden mb-2 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                        <div className={`h-full rounded-full transition-all duration-500 ${sc.bar}`} style={{ width: `${Math.min(cat.percentage, 100)}%` }} />
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Spent: {formatCurrency(cat.spent)}</span>
                                    <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {cat.budget > 0 ? `Remaining: ${formatCurrency(cat.remaining)}` : `Budget: ${formatCurrency(0)}`}
                                    </span>
                                </div>
                                {cat.percentage >= 100 && (
                                    <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium text-red-500`}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-[10px]" />
                                        Over budget by {formatCurrency(Math.abs(cat.remaining))}
                                    </div>
                                )}
                                {cat.percentage >= 80 && cat.percentage < 100 && (
                                    <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-500`}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-[10px]" />
                                        Approaching budget limit
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className={`${card} p-8 text-center`}>
                    <FontAwesomeIcon icon={faCalendarAlt} className={`text-3xl mb-3 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No budget categories set up.</p>
                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>Go to Categories tab to create expense categories with budgets.</p>
                </div>
            )}
        </div>
    )
}

// ==================== CATEGORIES TAB ====================

const CategoriesTab = ({
    categories, categoryForm, setCategoryForm, editingCategory, showCategoryForm,
    setShowCategoryForm, handleCategorySubmit, handleEditCategory, handleDeleteCategory,
    setEditingCategory, deleteConfirm, isLight, card, inputCls, selectCls, btnPrimary,
    btnSecondary, formatCurrency, emptyCategory, isLoading
}) => {
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(2)].map((_, g) => (
                    <div key={g} className={`${card} overflow-hidden`}>
                        <div className={`px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            <div className={`h-4 w-32 ${pulse}`} />
                        </div>
                        <div className="p-4 space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${pulse}`} />
                                    <div className="flex-1">
                                        <div className={`h-3.5 w-24 ${pulse}`} />
                                    </div>
                                    <div className={`h-3 w-16 ${pulse}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const expenseCats = categories.filter(c => c.type === 'expense')
    const incomeCats = categories.filter(c => c.type === 'income')

    return (
        <div className="space-y-4">
            <div className={`${card} p-5`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                        {editingCategory ? 'Edit Category' : 'Manage Categories'}
                    </h3>
                    <button
                        onClick={() => { setShowCategoryForm(!showCategoryForm); setEditingCategory(null); setCategoryForm(emptyCategory) }}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                            showCategoryForm
                                ? (isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1f1f1f] text-gray-400')
                                : (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                        }`}
                    >
                        <FontAwesomeIcon icon={showCategoryForm ? faTimes : faPlus} className="text-[10px]" />
                        {showCategoryForm ? 'Cancel' : 'New Category'}
                    </button>
                </div>

                {showCategoryForm && (
                    <div className={`p-4 rounded-lg mb-4 border border-solid ${isLight ? 'bg-slate-50/50 border-slate-200/60' : 'bg-[#141414] border-[#2B2B2B]'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Name</label>
                                <input type="text" placeholder="Category name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className={inputCls} />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Type</label>
                                <select value={categoryForm.type} onChange={e => setCategoryForm({...categoryForm, type: e.target.value})} className={`${selectCls} w-full`}>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Monthly Budget</label>
                                <input type="number" placeholder="0.00" value={categoryForm.budget} onChange={e => setCategoryForm({...categoryForm, budget: e.target.value})} className={inputCls} min="0" step="0.01" />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Color</label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {CATEGORY_COLORS.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCategoryForm({...categoryForm, color: c})}
                                            className={`w-7 h-7 rounded-full transition-all ${categoryForm.color === c ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: c, ringColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => { setShowCategoryForm(false); setEditingCategory(null); setCategoryForm(emptyCategory) }} className={btnSecondary}>Cancel</button>
                            <button onClick={handleCategorySubmit} className={btnPrimary} disabled={!categoryForm.name}>
                                <FontAwesomeIcon icon={editingCategory ? faCheck : faPlus} className="mr-1.5 text-xs" />
                                {editingCategory ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Expense Categories */}
            <div className={`${card} p-5`}>
                <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                    Expense Categories ({expenseCats.length})
                </h4>
                {expenseCats.length > 0 ? (
                    <div className="space-y-2">
                        {expenseCats.map(cat => (
                            <div key={cat._id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#141414]'}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                    <div className="min-w-0">
                                        <span className={`text-sm font-medium block truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{cat.name}</span>
                                        {cat.budget > 0 && (
                                            <span className={`text-xs block sm:inline sm:ml-2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Budget: {formatCurrency(cat.budget)}/mo</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditCategory(cat)} className={`w-7 h-7 rounded-md flex items-center justify-center ${isLight ? 'hover:bg-blue-100 text-blue-500' : 'hover:bg-blue-900/30 text-blue-400'}`}>
                                        <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(cat._id)} className={`w-7 h-7 rounded-md flex items-center justify-center ${deleteConfirm === cat._id ? (isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400') : (isLight ? 'hover:bg-red-100 text-red-500' : 'hover:bg-red-900/30 text-red-400')}`}>
                                        <FontAwesomeIcon icon={deleteConfirm === cat._id ? faExclamationTriangle : faTrash} className="text-[10px]" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No expense categories yet.</p>
                )}
            </div>

            {/* Income Categories */}
            <div className={`${card} p-5`}>
                <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                    Income Categories ({incomeCats.length})
                </h4>
                {incomeCats.length > 0 ? (
                    <div className="space-y-2">
                        {incomeCats.map(cat => (
                            <div key={cat._id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#141414]'}`}>
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                    <span className={`text-sm font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditCategory(cat)} className={`w-7 h-7 rounded-md flex items-center justify-center ${isLight ? 'hover:bg-blue-100 text-blue-500' : 'hover:bg-blue-900/30 text-blue-400'}`}>
                                        <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(cat._id)} className={`w-7 h-7 rounded-md flex items-center justify-center ${deleteConfirm === cat._id ? (isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400') : (isLight ? 'hover:bg-red-100 text-red-500' : 'hover:bg-red-900/30 text-red-400')}`}>
                                        <FontAwesomeIcon icon={deleteConfirm === cat._id ? faExclamationTriangle : faTrash} className="text-[10px]" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No income categories yet.</p>
                )}
            </div>
        </div>
    )
}

// ==================== SAVINGS TAB ====================

const DENOMINATIONS = [
    { label: '₱ 1000', value: 1000, type: 'bill' },
    { label: '₱ 500', value: 500, type: 'bill' },
    { label: '₱ 200', value: 200, type: 'bill' },
    { label: '₱ 100', value: 100, type: 'bill' },
    { label: '₱ 50', value: 50, type: 'bill' },
    { label: '₱ 20', value: 20, type: 'coin' },
    { label: '₱ 10', value: 10, type: 'coin' },
    { label: '₱ 5', value: 5, type: 'coin' },
    { label: '₱ 1', value: 1, type: 'coin' },
]

const SavingsTab = ({ isLight, card, inputCls, formatCurrency, dispatch, savings, savingsHistory, isLoading }) => {
    const [counts, setCounts] = useState(() => {
        const init = {}
        DENOMINATIONS.forEach(d => { init[d.value] = '' })
        return init
    })
    const [hasChanges, setHasChanges] = useState(false)
    const [loaded, setLoaded] = useState(false)
    const [subTab, setSubTab] = useState('counter')
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)

    useEffect(() => {
        dispatch(getBudgetSavings())
        dispatch(getBudgetSavingsHistory())
    }, [dispatch])

    useEffect(() => {
        if (savings && Object.keys(savings).length > 0 && !loaded) {
            const restored = {}
            DENOMINATIONS.forEach(d => {
                const val = savings[d.value]
                restored[d.value] = val ? parseInt(val) : ''
            })
            setCounts(restored)
            setLoaded(true)
        }
    }, [savings, loaded])

    const updateCount = (denom, val) => {
        const n = val === '' ? '' : parseInt(val) || 0
        setCounts(prev => ({ ...prev, [denom]: n }))
        setHasChanges(true)
    }

    const getAmount = (denom) => {
        const c = counts[denom]
        return (c === '' ? 0 : c) * denom
    }

    const billsDenoms = DENOMINATIONS.filter(d => d.type === 'bill')
    const coinsDenoms = DENOMINATIONS.filter(d => d.type === 'coin')

    const totalBills = billsDenoms.reduce((s, d) => s + getAmount(d.value), 0)
    const totalCoins = coinsDenoms.reduce((s, d) => s + getAmount(d.value), 0)
    const grandTotal = totalBills + totalCoins

    const handleSave = async () => {
        const denominations = {}
        DENOMINATIONS.forEach(d => { denominations[d.value] = counts[d.value] === '' ? 0 : counts[d.value] })
        await dispatch(saveBudgetSavings({ denominations }))
        dispatch(getBudgetSavingsHistory())
        setHasChanges(false)
    }

    const handleClear = () => {
        const init = {}
        DENOMINATIONS.forEach(d => { init[d.value] = '' })
        setCounts(init)
        setHasChanges(true)
    }

    const handleDeleteHistory = (id) => {
        if (deleteConfirmId === id) {
            dispatch(deleteBudgetSavingsHistory(id))
            setDeleteConfirmId(null)
        } else {
            setDeleteConfirmId(id)
        }
    }

    const rowBg = (i) => isLight
        ? i % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
        : i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'

    const savingsSubTabs = [
        { id: 'counter', label: 'Counter', icon: faCoins },
        { id: 'history', label: 'History', icon: faHistory },
    ]

    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className={`${card} p-5`}>
                    <div className={`h-4 w-28 mb-4 ${pulse}`} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg ${pulse}`} />
                                <div className="flex-1 space-y-1">
                                    <div className={`h-3 w-10 ${pulse}`} />
                                    <div className={`h-3 w-14 ${pulse}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`${card} p-5`}>
                    <div className={`h-6 w-32 mx-auto ${pulse}`} />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-5">
            {/* Sub Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-1">
                    {savingsSubTabs.map(t => (
                        <button key={t.id} onClick={() => setSubTab(t.id)} className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${subTab === t.id ? (isLight ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-white/5')}`}>
                            <FontAwesomeIcon icon={t.icon} className="text-[10px]" />
                            {t.label}
                            {t.id === 'history' && savingsHistory?.length > 0 && <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${subTab === t.id ? (isLight ? 'bg-blue-100' : 'bg-blue-500/20') : (isLight ? 'bg-slate-200' : 'bg-white/10')}`}>{savingsHistory.length}</span>}
                        </button>
                    ))}
                </div>
                {subTab === 'counter' && (
                    <div className="flex items-center gap-2">
                        <button onClick={handleClear} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-400'}`}>
                            Clear All
                        </button>
                        {hasChanges && (
                            <button onClick={handleSave} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                <FontAwesomeIcon icon={faCheck} className="mr-1" /> Save
                            </button>
                        )}
                    </div>
                )}
            </div>

            {subTab === 'counter' && <>
            {/* Grand Total Card */}
            <div className={`${card} p-4 sm:p-5`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-500/10 text-blue-400'}`}>
                            <FontAwesomeIcon icon={faPiggyBank} className="text-base sm:text-lg" />
                        </div>
                        <div>
                            <p className={`text-[11px] sm:text-xs font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>TOTAL</p>
                            <p className={`text-xl sm:text-2xl font-bold tracking-tight ${isLight ? 'text-slate-800' : 'text-gray-100'}`}>{formatCurrency(grandTotal)}</p>
                        </div>
                    </div>
                    <div className="flex gap-4 sm:gap-6 ml-13 sm:ml-0">
                        <div className="sm:text-right">
                            <p className={`text-[10px] uppercase tracking-wider font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Bills</p>
                            <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(totalBills)}</p>
                        </div>
                        <div className="sm:text-right">
                            <p className={`text-[10px] uppercase tracking-wider font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Coins</p>
                            <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(totalCoins)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Denomination Table */}
            <div className={`${card} overflow-hidden`}>
                <table className="w-full text-sm">
                    <thead>
                        <tr className={isLight ? 'bg-slate-50 border-b border-solid border-slate-200/80' : 'bg-white/[0.03] border-b border-solid border-[#2B2B2B]'}>
                            <th className={`text-left px-3 sm:px-5 py-3 font-semibold text-[11px] sm:text-xs uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Denomination</th>
                            <th className={`text-center px-3 sm:px-5 py-3 font-semibold text-[11px] sm:text-xs uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Qty</th>
                            <th className={`text-right px-3 sm:px-5 py-3 font-semibold text-[11px] sm:text-xs uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DENOMINATIONS.map((d, i) => {
                            const amt = getAmount(d.value)
                            return (
                                <tr key={d.value} className={`${rowBg(i)} border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'} transition-colors ${amt > 0 ? (isLight ? '!bg-blue-50/50' : '!bg-blue-500/[0.04]') : ''}`}>
                                    <td className="px-3 sm:px-5 py-2.5 sm:py-3">
                                        <div className="flex items-center gap-2 sm:gap-2.5">
                                            <span className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs font-bold ${d.type === 'bill' ? (isLight ? 'bg-green-100 text-green-700' : 'bg-green-500/15 text-green-400') : (isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/15 text-amber-400')}`}>
                                                <FontAwesomeIcon icon={d.type === 'bill' ? faMoneyBillWave : faCoins} />
                                            </span>
                                            <span className={`font-semibold text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{d.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-5 py-2">
                                        <div className="flex justify-center">
                                            <input
                                                type="number"
                                                min="0"
                                                value={counts[d.value]}
                                                onChange={e => updateCount(d.value, e.target.value)}
                                                placeholder="0"
                                                className={`${inputCls} w-16 sm:w-24 text-center !py-1.5`}
                                            />
                                        </div>
                                    </td>
                                    <td className={`px-3 sm:px-5 py-2.5 sm:py-3 text-right font-semibold tabular-nums text-xs sm:text-sm ${amt > 0 ? (isLight ? 'text-blue-600' : 'text-blue-400') : (isLight ? 'text-slate-300' : 'text-gray-600')}`}>
                                        {formatCurrency(amt)}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr className={`border-t-2 border-solid ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2B2B2B] bg-white/[0.03]'}`}>
                            <td className={`px-3 sm:px-5 py-2.5 sm:py-3 font-bold text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>BILLS</td>
                            <td></td>
                            <td className={`px-3 sm:px-5 py-2.5 sm:py-3 text-right font-bold tabular-nums text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(totalBills)}</td>
                        </tr>
                        <tr className={isLight ? 'bg-slate-50' : 'bg-white/[0.03]'}>
                            <td className={`px-3 sm:px-5 py-2.5 sm:py-3 font-bold text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>COINS</td>
                            <td></td>
                            <td className={`px-3 sm:px-5 py-2.5 sm:py-3 text-right font-bold tabular-nums text-xs sm:text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(totalCoins)}</td>
                        </tr>
                        <tr className={`border-t-2 border-solid ${isLight ? 'border-blue-200 bg-blue-50' : 'border-blue-500/20 bg-blue-500/[0.06]'}`}>
                            <td className={`px-3 sm:px-5 py-3 sm:py-4 font-bold text-sm sm:text-base ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>TOTAL</td>
                            <td></td>
                            <td className={`px-3 sm:px-5 py-3 sm:py-4 text-right font-bold text-sm sm:text-base tabular-nums ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>{formatCurrency(grandTotal)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            </>}

            {subTab === 'history' && (
                savingsHistory && savingsHistory.length > 0 ? (
                    <div className={`${card} overflow-hidden`}>
                        <div className="divide-y divide-solid" style={{ borderColor: isLight ? '#f1f5f9' : '#1f1f1f' }}>
                            {savingsHistory.map((entry, idx) => (
                                <div key={entry._id || idx} className={`px-3 sm:px-5 py-3 sm:py-3.5 ${isLight ? 'hover:bg-slate-50/50' : 'hover:bg-white/[0.02]'} transition-colors`}>
                                    <div className="flex items-start sm:items-center justify-between gap-2 mb-2">
                                        <span className={`text-[11px] sm:text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                            {new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            {' · '}
                                            {new Date(entry.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${entry.diffTotal > 0 ? (isLight ? 'bg-green-100 text-green-700' : 'bg-green-500/15 text-green-400') : entry.diffTotal < 0 ? (isLight ? 'bg-red-100 text-red-700' : 'bg-red-500/15 text-red-400') : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-gray-400')}`}>
                                                {entry.diffTotal > 0 ? '+' : ''}{formatCurrency(entry.diffTotal)}
                                            </span>
                                            <button onClick={() => handleDeleteHistory(entry._id)} className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${deleteConfirmId === entry._id ? (isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400') : (isLight ? 'hover:bg-red-50 text-slate-300 hover:text-red-500' : 'hover:bg-red-900/20 text-gray-600 hover:text-red-400')}`}>
                                                <FontAwesomeIcon icon={deleteConfirmId === entry._id ? faExclamationTriangle : faTrash} className="text-[10px]" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                        {entry.changes.map((c, ci) => (
                                            <span key={ci} className={`inline-flex items-center gap-1 text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md ${c.diff > 0 ? (isLight ? 'bg-green-50 text-green-600' : 'bg-green-500/10 text-green-400') : (isLight ? 'bg-red-50 text-red-600' : 'bg-red-500/10 text-red-400')}`}>
                                                <FontAwesomeIcon icon={c.diff > 0 ? faArrowUp : faArrowDown} className="text-[8px] sm:text-[9px]" />
                                                ₱{c.denomination}
                                                <span className="font-semibold">{c.diff > 0 ? '+' : ''}{c.diff}</span>
                                                <span className="opacity-50 hidden sm:inline">({c.previous}→{c.current})</span>
                                            </span>
                                        ))}
                                    </div>
                                    <div className={`flex items-center gap-2 sm:gap-3 mt-2 text-[10px] sm:text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                        <span>Before: {formatCurrency(entry.previousTotal)}</span>
                                        <span>→</span>
                                        <span>After: {formatCurrency(entry.newTotal)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`${card} text-center py-16 px-5`}>
                        <FontAwesomeIcon icon={faHistory} className={`text-3xl mb-3 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No changes recorded yet.</p>
                        <p className={`text-xs mt-1 ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>Save your denomination counts to start tracking.</p>
                    </div>
                )
            )}
        </div>
    )
}

// ==================== DEBT TAB ====================

const DebtTab = ({ debts, categories, dispatch, isLight, card, inputCls, selectCls, btnPrimary, btnSecondary, formatCurrency, isLoading }) => {
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', type: 'owe', person: '', total_amount: '', due_date: '', notes: '' })
    const [paymentForm, setPaymentForm] = useState({ debtId: null, amount: '', notes: '', category: '', paymentMethod: 'Cash' })
    const [expandedId, setExpandedId] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => { dispatch(getDebts()) }, [])

    const resetForm = () => {
        setForm({ name: '', type: 'owe', person: '', total_amount: '', due_date: '', notes: '' })
        setEditing(null)
        setShowForm(false)
    }

    const handleSubmit = async () => {
        if (!form.name || !form.total_amount) return
        const data = { ...form, total_amount: parseFloat(form.total_amount) }
        if (editing) {
            await dispatch(updateDebt({ ...data, id: editing }))
        } else {
            await dispatch(createDebt(data))
        }
        resetForm()
    }

    const handleEdit = (d) => {
        setForm({
            name: d.name, type: d.type, person: d.person || '',
            total_amount: d.total_amount.toString(),
            due_date: d.due_date ? new Date(d.due_date).toISOString().split('T')[0] : '',
            notes: d.notes || ''
        })
        setEditing(d._id)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (deleteConfirm === id) {
            await dispatch(deleteDebt(id))
            setDeleteConfirm(null)
        } else {
            setDeleteConfirm(id)
            setTimeout(() => setDeleteConfirm(null), 3000)
        }
    }

    const handlePayment = async () => {
        if (!paymentForm.amount || !paymentForm.debtId) return
        await dispatch(addDebtPayment({ id: paymentForm.debtId, amount: parseFloat(paymentForm.amount), notes: paymentForm.notes, category: paymentForm.category || null, paymentMethod: paymentForm.paymentMethod }))
        setPaymentForm({ debtId: null, amount: '', notes: '', category: '', paymentMethod: 'Cash' })
    }

    const handleRemovePayment = async (debtId, paymentId) => {
        await dispatch(removeDebtPayment({ id: debtId, paymentId }))
    }

    const handleToggle = async (id) => {
        await dispatch(toggleDebtStatus(id))
    }

    const filtered = useMemo(() => {
        if (!debts) return []
        if (filterStatus === 'all') return debts
        return debts.filter(d => d.status === filterStatus)
    }, [debts, filterStatus])

    const totalOwed = debts?.filter(d => d.type === 'owe' && d.status === 'active').reduce((s, d) => s + (d.total_amount - d.amount_paid), 0) || 0
    const totalOwedToYou = debts?.filter(d => d.type === 'owed' && d.status === 'active').reduce((s, d) => s + (d.total_amount - d.amount_paid), 0) || 0
    const activeCount = debts?.filter(d => d.status === 'active').length || 0
    const paidCount = debts?.filter(d => d.status === 'paid').length || 0

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`${card} p-4`}>
                            <div className={`h-3 w-24 mb-2 ${pulse}`} />
                            <div className={`h-6 w-32 ${pulse}`} />
                        </div>
                    ))}
                </div>
                <div className={`${card} overflow-hidden`}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`flex items-center gap-3 px-5 py-4 ${i > 0 ? `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}` : ''}`}>
                            <div className={`w-10 h-10 rounded-lg ${pulse}`} />
                            <div className="flex-1 space-y-1.5">
                                <div className={`h-3.5 w-40 ${pulse}`} />
                                <div className={`h-2.5 w-24 ${pulse}`} />
                            </div>
                            <div className={`h-5 w-20 ${pulse}`} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const labelCls = `block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`${card} p-4`}>
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>You Owe</p>
                    <p className={`text-lg font-bold mt-1 text-red-500`}>{formatCurrency(totalOwed)}</p>
                </div>
                <div className={`${card} p-4`}>
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Owed to You</p>
                    <p className={`text-lg font-bold mt-1 text-emerald-500`}>{formatCurrency(totalOwedToYou)}</p>
                </div>
                <div className={`${card} p-4`}>
                    <p className={`text-[10px] font-medium uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Active / Paid</p>
                    <p className={`text-lg font-bold mt-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        {activeCount} <span className={`text-sm font-normal ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>/ {paidCount}</span>
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className={`${card} overflow-hidden`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-violet-100' : 'bg-violet-900/30'}`}>
                            <FontAwesomeIcon icon={faHandHoldingUsd} className={`text-sm ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                            Debts
                            <span className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-gray-500'}`}>{debts?.length || 0}</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                            className={`${selectCls} text-xs py-1.5`}>
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="paid">Paid</option>
                        </select>
                        <button onClick={() => { resetForm(); setShowForm(true) }}
                            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                            <FontAwesomeIcon icon={faPlus} className="text-[10px]" /> Add Debt
                        </button>
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div className={`px-4 sm:px-5 py-4 border-b border-solid ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#0a0a0a]'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className={labelCls}>Name *</label>
                                <input type="text" className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Car loan, Rent" />
                            </div>
                            <div>
                                <label className={labelCls}>Type</label>
                                <select className={`${selectCls} w-full`} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="owe">I Owe (Payable)</option>
                                    <option value="owed">Owed to Me (Receivable)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Person / Entity</label>
                                <input type="text" className={inputCls} value={form.person} onChange={e => setForm({ ...form, person: e.target.value })} placeholder="Who?" />
                            </div>
                            <div>
                                <label className={labelCls}>Total Amount *</label>
                                <input type="number" className={inputCls} value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })} placeholder="0.00" min="0" step="0.01" />
                            </div>
                            <div>
                                <label className={labelCls}>Due Date</label>
                                <input type="date" className={inputCls} value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelCls}>Notes</label>
                                <input type="text" className={inputCls} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={resetForm} className={`${btnSecondary} text-xs px-3 py-1.5`}>Cancel</button>
                            <button onClick={handleSubmit} disabled={!form.name || !form.total_amount}
                                className={`${btnPrimary} text-xs px-3 py-1.5 disabled:opacity-50`}>
                                <FontAwesomeIcon icon={faCheck} className="text-[10px] mr-1.5" />
                                {editing ? 'Update' : 'Add Debt'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Debt List */}
                {filtered.length > 0 ? (
                    <div className={`divide-y divide-solid ${isLight ? 'divide-slate-100' : 'divide-[#1f1f1f]'}`}>
                        {filtered.map(debt => {
                            const remaining = debt.total_amount - debt.amount_paid
                            const pct = debt.total_amount > 0 ? Math.round((debt.amount_paid / debt.total_amount) * 100) : 0
                            const isPaid = debt.status === 'paid'
                            const isOverdue = debt.due_date && !isPaid && new Date(debt.due_date) < new Date()
                            const isExpanded = expandedId === debt._id
                            const isPaymentOpen = paymentForm.debtId === debt._id

                            return (
                                <div key={debt._id}>
                                    <div className={`px-4 sm:px-5 py-3.5 transition-colors ${isLight ? 'hover:bg-slate-50/50' : 'hover:bg-[#111]'}`}>
                                        <div className="flex items-start gap-3">
                                            {/* Type icon */}
                                            <button onClick={() => handleToggle(debt._id)}
                                                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isPaid
                                                    ? (isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-900/30 text-emerald-400')
                                                    : debt.type === 'owe'
                                                        ? (isLight ? 'bg-red-50 text-red-500' : 'bg-red-900/20 text-red-400')
                                                        : (isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-900/20 text-blue-400')
                                                }`} title={isPaid ? 'Mark as active' : 'Mark as paid'}>
                                                <FontAwesomeIcon icon={isPaid ? faCheckCircle : (debt.type === 'owe' ? faArrowUp : faArrowDown)} className="text-xs" />
                                            </button>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                    <h4 className={`text-sm font-semibold ${isPaid ? 'line-through opacity-50' : ''} ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{debt.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${debt.type === 'owe'
                                                            ? (isLight ? 'bg-red-50 text-red-500' : 'bg-red-900/20 text-red-400')
                                                            : (isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-900/20 text-blue-400')
                                                        }`}>{debt.type === 'owe' ? 'Payable' : 'Receivable'}</span>
                                                        {isPaid && <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400'}`}>Paid</span>}
                                                        {isOverdue && <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isLight ? 'bg-amber-50 text-amber-600' : 'bg-amber-900/20 text-amber-400'}`}>Overdue</span>}
                                                    </div>
                                                </div>
                                                <div className={`flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                    {debt.person && (
                                                        <span className="flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faUserFriends} className="text-[9px]" /> {debt.person}
                                                        </span>
                                                    )}
                                                    {debt.due_date && (
                                                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-amber-500' : ''}`}>
                                                            <FontAwesomeIcon icon={faCalendarCheck} className="text-[9px]" />
                                                            {new Date(debt.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                    {debt.notes && <span className="truncate max-w-[200px]">{debt.notes}</span>}
                                                </div>

                                                {/* Progress bar */}
                                                <div className="mt-2">
                                                    <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                                        <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${Math.min(pct, 100)}%` }} />
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                            {formatCurrency(debt.amount_paid)} / {formatCurrency(debt.total_amount)}
                                                        </span>
                                                        <span className={`text-[10px] font-semibold ${pct >= 100 ? 'text-emerald-500' : (isLight ? 'text-slate-500' : 'text-gray-400')}`}>{pct}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {!isPaid && (
                                                    <button onClick={() => setPaymentForm(prev => prev.debtId === debt._id ? { debtId: null, amount: '', notes: '', category: '', paymentMethod: 'Cash' } : { debtId: debt._id, amount: '', notes: '', category: '', paymentMethod: 'Cash' })}
                                                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isPaymentOpen
                                                            ? (isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-900/30 text-emerald-400')
                                                            : (isLight ? 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20')
                                                        }`} title="Add payment">
                                                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                                                    </button>
                                                )}
                                                <button onClick={() => setExpandedId(isExpanded ? null : debt._id)}
                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-50' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]'}`}
                                                    title="Payment history">
                                                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-[10px]" />
                                                </button>
                                                <button onClick={() => handleEdit(debt)}
                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isLight ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/20'}`}
                                                    title="Edit">
                                                    <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                                </button>
                                                <button onClick={() => handleDelete(debt._id)}
                                                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${deleteConfirm === debt._id
                                                        ? (isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400')
                                                        : (isLight ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-red-400 hover:text-red-300 hover:bg-red-900/20')
                                                    }`} title="Delete">
                                                    <FontAwesomeIcon icon={deleteConfirm === debt._id ? faExclamationTriangle : faTrash} className="text-[10px]" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Payment form inline */}
                                        {isPaymentOpen && (
                                            <div className={`mt-3 pt-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className={`text-[10px] font-medium mb-1 block ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Amount *</label>
                                                        <input type="number" className={`${inputCls} text-xs`} value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                                            placeholder={`Remaining: ${formatCurrency(remaining)}`} min="0" step="0.01" />
                                                    </div>
                                                    <div>
                                                        <label className={`text-[10px] font-medium mb-1 block ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Payment Method</label>
                                                        <select className={`${selectCls} w-full text-xs`} value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}>
                                                            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={`text-[10px] font-medium mb-1 block ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Category</label>
                                                        <select className={`${selectCls} w-full text-xs`} value={paymentForm.category} onChange={e => setPaymentForm({ ...paymentForm, category: e.target.value })}>
                                                            <option value="">Uncategorized</option>
                                                            {categories.filter(c => c.type === (debt.type === 'owe' ? 'expense' : 'income')).map(c => (
                                                                <option key={c._id} value={c._id}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={`text-[10px] font-medium mb-1 block ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Notes</label>
                                                        <input type="text" className={`${inputCls} text-xs`} value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} placeholder="Optional" />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end">
                                                    <button onClick={handlePayment} disabled={!paymentForm.amount}
                                                        className={`${btnPrimary} text-xs px-3 py-2 disabled:opacity-50 whitespace-nowrap`}>
                                                        <FontAwesomeIcon icon={faCheck} className="text-[10px] mr-1" /> Record Payment
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment history (expanded) */}
                                    {isExpanded && (
                                        <div className={`px-4 sm:px-5 pb-3 ${isLight ? 'bg-slate-50/50' : 'bg-[#0a0a0a]'}`}>
                                            {debt.payments?.length > 0 ? (
                                                <div className={`rounded-lg overflow-hidden border border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                                    <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#111] text-gray-500'}`}>
                                                        Payment History ({debt.payments.length})
                                                    </div>
                                                    {debt.payments.slice().reverse().map((p, pi) => (
                                                        <div key={p._id || pi} className={`flex items-center justify-between px-3 py-2 text-xs ${pi > 0 ? `border-t border-solid ${isLight ? 'border-slate-50' : 'border-[#1a1a1a]'}` : `border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`} ${isLight ? 'bg-white' : 'bg-[#0e0e0e]'}`}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={isLight ? 'text-slate-400' : 'text-gray-500'}>
                                                                    {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                                {p.notes && <span className={`${isLight ? 'text-slate-300' : 'text-gray-600'}`}>· {p.notes}</span>}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-emerald-500">{formatCurrency(p.amount)}</span>
                                                                <button onClick={() => handleRemovePayment(debt._id, p._id)}
                                                                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isLight ? 'text-slate-300 hover:text-red-500 hover:bg-red-50' : 'text-gray-600 hover:text-red-400 hover:bg-red-900/20'}`}>
                                                                    <FontAwesomeIcon icon={faTimes} className="text-[8px]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className={`text-xs text-center py-4 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No payments recorded yet.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 px-5">
                        <FontAwesomeIcon icon={faHandHoldingUsd} className={`text-3xl mb-3 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            {filterStatus !== 'all' ? 'No debts match this filter.' : 'No debts tracked yet.'}
                        </p>
                        <p className={`text-xs mt-1 ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>
                            {filterStatus !== 'all' ? 'Try a different filter.' : 'Click "Add Debt" to start tracking.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ==================== SUMMARY TAB ====================

const SummaryTab = ({ dashboard, expenses, categories, monthlyBudgetData, groupedByDate, month, year, isLight, card, formatCurrency, statusColor, paymentIcon, isLoading }) => {
    const summaryRef = useRef(null)
    const [downloading, setDownloading] = useState(false)
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`

    const PDF_WIDTH = 800

    const handleDownloadPDF = async () => {
        if (!summaryRef.current || downloading) return
        setDownloading(true)

        const el = summaryRef.current
        const origWidth = el.style.width
        const origMinWidth = el.style.minWidth
        const origMaxWidth = el.style.maxWidth

        try {
            el.style.width = `${PDF_WIDTH}px`
            el.style.minWidth = `${PDF_WIDTH}px`
            el.style.maxWidth = `${PDF_WIDTH}px`

            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))

            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: isLight ? '#ffffff' : '#0a0a0a',
                windowWidth: PDF_WIDTH,
                width: PDF_WIDTH,
            })

            el.style.width = origWidth
            el.style.minWidth = origMinWidth
            el.style.maxWidth = origMaxWidth

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfW = pdf.internal.pageSize.getWidth()
            const imgW = canvas.width
            const imgH = canvas.height
            const ratio = pdfW / imgW
            const pdfH = imgH * ratio
            const pageH = pdf.internal.pageSize.getHeight()

            let pos = 0
            pdf.addImage(imgData, 'PNG', 0, pos, pdfW, pdfH)
            let remaining = pdfH - pageH
            while (remaining > 0) {
                pos -= pageH
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, pos, pdfW, pdfH)
                remaining -= pageH
            }

            pdf.save(`Budget_Summary_${MONTHS[month - 1]}_${year}.pdf`)
        } catch (err) {
            console.error('PDF generation failed:', err)
            el.style.width = origWidth
            el.style.minWidth = origMinWidth
            el.style.maxWidth = origMaxWidth
        } finally {
            setDownloading(false)
        }
    }

    if (isLoading || !dashboard) {
        return (
            <div className="space-y-4">
                <div className={`${card} p-5`}>
                    <div className={`h-5 w-48 mb-4 ${pulse}`} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i}>
                                <div className={`h-3 w-20 mb-2 ${pulse}`} />
                                <div className={`h-6 w-28 ${pulse}`} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`${card} p-5`}>
                    <div className={`h-4 w-40 mb-4 ${pulse}`} />
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-2">
                            <div className={`h-3 w-32 ${pulse}`} />
                            <div className={`h-3 w-20 ${pulse}`} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const d = dashboard
    const totalIncome = d.totalIncome || 0
    const totalExpenses = d.totalExpenses || 0
    const balance = d.balance || 0
    const totalBudget = d.totalBudget || 0
    const budgetUsedPct = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0
    const daysInMonth = new Date(year, month, 0).getDate()
    const dailyAvg = d.transactionCount > 0 ? totalExpenses / daysInMonth : 0

    const expenseCats = categories.filter(c => c.type === 'expense')
    const incomeCats = categories.filter(c => c.type === 'income')

    const catSpending = expenseCats.map(cat => {
        const spent = expenses.filter(e => e.category?._id === cat._id && e.type === 'expense').reduce((s, e) => s + e.amount, 0)
        return { ...cat, spent }
    }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent)

    const catIncome = incomeCats.map(cat => {
        const earned = expenses.filter(e => e.category?._id === cat._id && e.type === 'income').reduce((s, e) => s + e.amount, 0)
        return { ...cat, earned }
    }).filter(c => c.earned > 0).sort((a, b) => b.earned - a.earned)

    const paymentTotals = d.paymentMethodTotals || {}
    const sortedPayments = Object.entries(paymentTotals).sort((a, b) => b[1] - a[1])

    const sectionTitle = `text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b border-solid ${isLight ? 'text-slate-400 border-slate-100' : 'text-gray-500 border-[#1f1f1f]'}`
    const rowCls = `flex items-center justify-between py-1.5 text-xs`
    const labelCls = isLight ? 'text-slate-600' : 'text-gray-300'
    const valueCls = `font-semibold ${isLight ? 'text-slate-800' : 'text-gray-100'}`

    return (
        <div className="space-y-4">
            {/* Download Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${isLight
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                >
                    {downloading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faFilePdf} className="text-xs" />
                            Download PDF
                        </>
                    )}
                </button>
            </div>

            {/* Printable Summary */}
            <div ref={summaryRef} className={`${card} overflow-hidden`} style={{ minWidth: 600 }}>
                {/* Header */}
                <div className={`px-6 py-5 border-b border-solid ${isLight ? 'border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50' : 'border-[#1f1f1f] bg-gradient-to-r from-blue-900/10 to-indigo-900/10'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                Monthly Budget Summary
                            </h2>
                            <p className={`text-sm mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                {MONTHS[month - 1]} {year}
                            </p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-white shadow-sm' : 'bg-[#1a1a1a]'}`}>
                            <FontAwesomeIcon icon={faWallet} className={`text-lg ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Total Income', value: formatCurrency(totalIncome), color: 'emerald' },
                            { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: 'red' },
                            { label: 'Net Balance', value: formatCurrency(balance), color: balance >= 0 ? 'blue' : 'red' },
                            { label: 'Budget Used', value: totalBudget > 0 ? `${budgetUsedPct}%` : '—', color: budgetUsedPct >= 100 ? 'red' : budgetUsedPct >= 80 ? 'amber' : 'emerald' },
                        ].map((item, i) => {
                            const colors = {
                                emerald: isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-900/15 text-emerald-400 border-emerald-800/30',
                                red: isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-900/15 text-red-400 border-red-800/30',
                                blue: isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-900/15 text-blue-400 border-blue-800/30',
                                amber: isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-900/15 text-amber-400 border-amber-800/30',
                            }
                            return (
                                <div key={i} className={`rounded-lg p-3 border border-solid ${colors[item.color]}`}>
                                    <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">{item.label}</p>
                                    <p className="text-base font-bold mt-1">{item.value}</p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Quick Stats Row */}
                    <div className={`flex flex-wrap gap-4 px-4 py-3 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Transactions</span>
                            <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{d.transactionCount}</span>
                        </div>
                        <div className={`w-px h-4 ${isLight ? 'bg-slate-200' : 'bg-[#2B2B2B]'}`} />
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Total Budget</span>
                            <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(totalBudget)}</span>
                        </div>
                        <div className={`w-px h-4 ${isLight ? 'bg-slate-200' : 'bg-[#2B2B2B]'}`} />
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Daily Avg</span>
                            <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(dailyAvg)}</span>
                        </div>
                        <div className={`w-px h-4 ${isLight ? 'bg-slate-200' : 'bg-[#2B2B2B]'}`} />
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Remaining</span>
                            <span className={`text-xs font-bold ${d.remainingBudget >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(d.remainingBudget)}</span>
                        </div>
                    </div>

                    {/* Two Column: Expense Categories + Income Sources */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Expense Breakdown */}
                        <div>
                            <h4 className={sectionTitle}>
                                <FontAwesomeIcon icon={faArrowDown} className="mr-1.5 text-red-400 text-[10px]" />
                                Expense Breakdown
                            </h4>
                            {catSpending.length > 0 ? (
                                <div className="space-y-0.5">
                                    {catSpending.map((cat) => {
                                        const pct = totalExpenses > 0 ? Math.round((cat.spent / totalExpenses) * 100) : 0
                                        return (
                                            <div key={cat._id} className={rowCls}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                                    <span className={labelCls}>{cat.name}</span>
                                                    <span className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>{pct}%</span>
                                                </div>
                                                <span className={valueCls}>{formatCurrency(cat.spent)}</span>
                                            </div>
                                        )
                                    })}
                                    <div className={`flex items-center justify-between pt-2 mt-1 border-t border-solid text-xs font-bold ${isLight ? 'border-slate-100 text-red-600' : 'border-[#1f1f1f] text-red-400'}`}>
                                        <span>Total Expenses</span>
                                        <span>{formatCurrency(totalExpenses)}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No expenses recorded.</p>
                            )}
                        </div>

                        {/* Income Breakdown */}
                        <div>
                            <h4 className={sectionTitle}>
                                <FontAwesomeIcon icon={faArrowUp} className="mr-1.5 text-emerald-400 text-[10px]" />
                                Income Sources
                            </h4>
                            {catIncome.length > 0 ? (
                                <div className="space-y-0.5">
                                    {catIncome.map((cat) => {
                                        const pct = totalIncome > 0 ? Math.round((cat.earned / totalIncome) * 100) : 0
                                        return (
                                            <div key={cat._id} className={rowCls}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                                    <span className={labelCls}>{cat.name}</span>
                                                    <span className={`text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`}>{pct}%</span>
                                                </div>
                                                <span className={valueCls}>{formatCurrency(cat.earned)}</span>
                                            </div>
                                        )
                                    })}
                                    <div className={`flex items-center justify-between pt-2 mt-1 border-t border-solid text-xs font-bold ${isLight ? 'border-slate-100 text-emerald-600' : 'border-[#1f1f1f] text-emerald-400'}`}>
                                        <span>Total Income</span>
                                        <span>{formatCurrency(totalIncome)}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No income recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Budget per Category */}
                    {monthlyBudgetData.length > 0 && (
                        <div>
                            <h4 className={sectionTitle}>
                                <FontAwesomeIcon icon={faChartPie} className="mr-1.5 text-blue-400 text-[10px]" />
                                Budget vs Actual
                            </h4>
                            <div className="overflow-hidden rounded-lg border border-solid" style={{ borderColor: isLight ? '#e2e8f0' : '#1f1f1f' }}>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className={isLight ? 'bg-slate-50 text-slate-400' : 'bg-[#111] text-gray-500'}>
                                            <th className="px-3 py-2 text-left font-semibold">Category</th>
                                            <th className="px-3 py-2 text-right font-semibold">Budget</th>
                                            <th className="px-3 py-2 text-right font-semibold">Spent</th>
                                            <th className="px-3 py-2 text-right font-semibold">Remaining</th>
                                            <th className="px-3 py-2 text-center font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyBudgetData.map((cat, i) => {
                                            const sc = statusColor(cat.percentage)
                                            return (
                                                <tr key={cat._id} className={`${i > 0 ? `border-t border-solid ${isLight ? 'border-slate-50' : 'border-[#1a1a1a]'}` : ''}`}>
                                                    <td className={`px-3 py-2 ${labelCls}`}>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                                            {cat.name}
                                                        </div>
                                                    </td>
                                                    <td className={`px-3 py-2 text-right ${valueCls}`}>{formatCurrency(cat.budget)}</td>
                                                    <td className={`px-3 py-2 text-right ${valueCls}`}>{formatCurrency(cat.spent)}</td>
                                                    <td className={`px-3 py-2 text-right font-semibold ${cat.remaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {formatCurrency(cat.remaining)}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.text} ${sc.bg}`}>
                                                            {cat.budget > 0 ? `${cat.percentage}%` : '—'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className={`border-t-2 border-solid ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2B2B2B] bg-[#111]'}`}>
                                            <td className={`px-3 py-2 font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Total</td>
                                            <td className={`px-3 py-2 text-right font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(totalBudget)}</td>
                                            <td className={`px-3 py-2 text-right font-bold text-red-500`}>{formatCurrency(totalExpenses)}</td>
                                            <td className={`px-3 py-2 text-right font-bold ${d.remainingBudget >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(d.remainingBudget)}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(budgetUsedPct).text} ${statusColor(budgetUsedPct).bg}`}>
                                                    {budgetUsedPct}%
                                                </span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Payment Methods */}
                    {sortedPayments.length > 0 && (
                        <div>
                            <h4 className={sectionTitle}>
                                <FontAwesomeIcon icon={faCreditCard} className="mr-1.5 text-indigo-400 text-[10px]" />
                                Payment Methods
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {sortedPayments.map(([method, amount]) => {
                                    const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
                                    return (
                                        <div key={method} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                                            <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-white' : 'bg-[#1a1a1a]'}`}>
                                                <FontAwesomeIcon icon={paymentIcon(method)} className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[11px] font-medium truncate ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{method}</p>
                                                <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatCurrency(amount)} · {pct}%</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Daily Transaction Log */}
                    {groupedByDate.length > 0 && (
                        <div>
                            <h4 className={sectionTitle}>
                                <FontAwesomeIcon icon={faCalendarDay} className="mr-1.5 text-amber-400 text-[10px]" />
                                Daily Transactions
                            </h4>
                            <div className="overflow-hidden rounded-lg border border-solid" style={{ borderColor: isLight ? '#e2e8f0' : '#1f1f1f' }}>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className={isLight ? 'bg-slate-50 text-slate-400' : 'bg-[#111] text-gray-500'}>
                                            <th className="px-3 py-2 text-left font-semibold">Date</th>
                                            <th className="px-3 py-2 text-left font-semibold">Description</th>
                                            <th className="px-3 py-2 text-left font-semibold">Category</th>
                                            <th className="px-3 py-2 text-left font-semibold">Method</th>
                                            <th className="px-3 py-2 text-right font-semibold">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedByDate.map(([date, group]) => (
                                            <React.Fragment key={date}>
                                                <tr className={isLight ? 'bg-slate-50/50' : 'bg-[#0a0a0a]'}>
                                                    <td colSpan={3} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                        {date}
                                                    </td>
                                                    <td className="px-3 py-1.5 text-right" colSpan={2}>
                                                        <div className="flex items-center justify-end gap-2">
                                                            {group.totalIncome > 0 && <span className="text-[10px] font-semibold text-emerald-500">+{formatCurrency(group.totalIncome)}</span>}
                                                            {group.totalExpense > 0 && <span className="text-[10px] font-semibold text-red-500">-{formatCurrency(group.totalExpense)}</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {group.items.map(e => (
                                                    <tr key={e._id} className={`border-t border-solid ${isLight ? 'border-slate-50' : 'border-[#1a1a1a]'}`}>
                                                        <td className={`px-3 py-1.5 whitespace-nowrap ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                            {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className={`px-3 py-1.5 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{e.description}</td>
                                                        <td className={`px-3 py-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.category?.color || '#94a3b8' }} />
                                                                {e.category?.name || 'Uncategorized'}
                                                            </div>
                                                        </td>
                                                        <td className={`px-3 py-1.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{e.paymentMethod}</td>
                                                        <td className={`px-3 py-1.5 text-right font-semibold whitespace-nowrap ${e.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className={`border-t-2 border-solid ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2B2B2B] bg-[#111]'}`}>
                                            <td colSpan={4} className={`px-3 py-2 font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                                Net Total ({expenses.length} transactions)
                                            </td>
                                            <td className={`px-3 py-2 text-right font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className={`flex items-center justify-between pt-4 mt-2 border-t border-solid text-[10px] ${isLight ? 'border-slate-100 text-slate-300' : 'border-[#1f1f1f] text-gray-600'}`}>
                        <span>Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        <span>Budget Manager · {MONTHS[month - 1]} {year}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Budget
