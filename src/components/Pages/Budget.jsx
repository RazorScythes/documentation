import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { main, dark, light } from '../../style'
import styles from '../../style'
import { useDispatch, useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { 
    faWallet, faChartPie, faCalendarDay, faCalendarAlt, faTags, faPlus, faMinus,
    faTrash, faPen, faCheck, faTimes, faArrowUp, faArrowDown, faEllipsisH,
    faMoneyBillWave, faCreditCard, faMobileAlt, faUniversity, faCoins,
    faExclamationTriangle, faCheckCircle, faArrowRight, faSyncAlt, faFileExport, faFilter, faPiggyBank, faHistory, faFilePdf,
    faHandHoldingUsd, faUserFriends, faCalendarCheck, faChevronDown, faChevronUp, faListAlt, faSearch, faCogs, faCircle,
    faEye, faEyeSlash, faExchangeAlt
} from '@fortawesome/free-solid-svg-icons'

library.add(fas)
import { put } from '@vercel/blob'
import { deleteReceipt as deleteReceiptApi } from '../../endpoint'
import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'
import { 
    getBudgetDashboard, getBudgetCategories, createBudgetCategory, updateBudgetCategory, 
    deleteBudgetCategory, shareBudgetCategory, unshareBudgetCategory,
    getBudgetExpenses, createBudgetExpense, updateBudgetExpense, 
    deleteBudgetExpense, bulkDeleteBudgetExpenses, bulkUpdateBudgetCategory, bulkUpdateBudgetCurrency,
    getExchangeRates, saveExchangeRates, resetExchangeRates,
    searchBudgetExpenses, importBudgetCSV, processRecurring,
    getBudgetSavings, saveBudgetSavings, getBudgetSavingsHistory, deleteBudgetSavingsHistory,
    getDebts, createDebt, updateDebt, deleteDebt, addDebtPayment, removeDebtPayment, toggleDebtStatus,
    getBudgetLists, createBudgetList, updateBudgetList, deleteBudgetList,
    getFinancialGoals, createFinancialGoal, updateFinancialGoal, deleteFinancialGoal, addGoalContribution,
    clearAlert, clearSearchResults
} from '../../actions/budget'
import Notification from '../Custom/Notification'

const PAYMENT_METHODS = ['Cash', 'GCash', 'Bank', 'BPI', 'Credit Card', 'Debit Card', 'PayPal', 'Other']
const CATEGORY_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const VALID_TABS = ['dashboard', 'daily', 'monthly', 'categories', 'savings', 'debts', 'lists', 'goals', 'summary']

const CURRENCIES = [
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'KRW', symbol: '₩', name: 'Korean Won' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
]

const DEFAULT_EXCHANGE_RATES = {
    USD: 0.0177,
    EUR: 0.0163,
    GBP: 0.0140,
    JPY: 2.6500,
    KRW: 24.5000,
    CNY: 0.1280,
    AUD: 0.0275,
    CAD: 0.0243,
    INR: 1.4900,
    THB: 0.6100,
}

const ICON_GRID = [
    'wallet', 'cart-shopping', 'utensils', 'house', 'car', 'bolt', 'droplet', 'wifi',
    'phone', 'tv', 'gamepad', 'shirt', 'graduation-cap', 'briefcase-medical', 'plane',
    'bus', 'gas-pump', 'basket-shopping', 'gift', 'heart', 'dumbbell', 'book',
    'music', 'film', 'coffee', 'pizza-slice', 'dog', 'cat', 'baby', 'pills',
    'tooth', 'scissors', 'paint-roller', 'hammer', 'wrench', 'laptop', 'mobile',
    'credit-card', 'piggy-bank', 'coins', 'money-bill-wave', 'chart-line', 'chart-pie',
    'building', 'church', 'school', 'store', 'hotel', 'tree', 'seedling', 'sun',
    'umbrella', 'snowflake', 'fire', 'cloud', 'star', 'gem', 'crown', 'trophy',
    'flag', 'bell', 'envelope', 'calendar', 'clock', 'tag', 'tags', 'bookmark',
]

const Budget = ({ user, theme }) => {
    const dispatch = useDispatch()
    const { dashboard, categories, expenses, savings, savingsHistory, debts, budgetLists, goals, searchResults, exchangeRates: savedRates, liveRates, baseCurrency: savedBaseCurrency, alert: budgetAlert, isLoading, isSavingsLoading } = useSelector(state => state.budget)
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
    const emptyExpense = { date: new Date().toISOString().split('T')[0], category: '', type: 'expense', paymentMethod: 'Cash', notes: '', currency: 'PHP', listOnly: false, isRecurring: false, recurrenceRule: '', recurrenceEnd: '' }
    const [expenseForm, setExpenseForm] = useState(emptyExpense)
    const [expenseItems, setExpenseItems] = useState([{ ...emptyItem }])
    const [editingExpense, setEditingExpense] = useState(null)
    const [showExpenseForm, setShowExpenseForm] = useState(false)

    // category form
    const emptyCategory = { name: '', color: '#3b82f6', type: 'expense', budget: '', icon: '', rollover: false }
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
            dispatch(processRecurring())
            dispatch(getExchangeRates())
            dispatch(getBudgetSavings())
            dispatch(getDebts())
            dispatch(getFinancialGoals())
        }
    }, [user])

    useEffect(() => {
        if (user) {
            dispatch(getBudgetDashboard({ month, year }))
            dispatch(getBudgetExpenses({ month, year }))
            setSelectedExpenses([])
            setBulkDeleteConfirm(false)
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

    const [attachmentPreview, setAttachmentPreview] = useState(null)
    const [uploadingReceipt, setUploadingReceipt] = useState(false)
    const [receiptViewer, setReceiptViewer] = useState(null)

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
        setAttachmentPreview(null)
        dispatch(getBudgetDashboard({ month, year }))
    }

    const handleEditExpense = (e) => {
        setExpenseForm({
            date: new Date(e.date).toISOString().split('T')[0],
            category: e.category?._id || '',
            type: e.type,
            paymentMethod: e.paymentMethod,
            notes: e.notes || '',
            currency: e.currency || 'PHP',
            listOnly: !!e.listOnly,
            attachments: e.attachments || [],
            isRecurring: !!e.isRecurring,
            recurrenceRule: e.recurrenceRule || '',
            recurrenceEnd: e.recurrenceEnd ? new Date(e.recurrenceEnd).toISOString().split('T')[0] : '',
        })
        setExpenseItems([{ description: e.description, amount: e.amount.toString() }])
        setEditingExpense(e._id)
        setShowExpenseForm(true)
        setAttachmentPreview(e.attachments?.[0] || null)
    }

    const handleReceiptUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !file.type.startsWith('image/')) return
        if (file.size > 5 * 1024 * 1024) return
        setUploadingReceipt(true)
        try {
            if (attachmentPreview?.includes('vercel-storage')) {
                await deleteReceiptApi({ url: attachmentPreview }).catch(() => {})
            }
            const blob = await put(`receipts/${Date.now()}_${file.name}`, file, {
                access: 'public', token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN
            })
            setAttachmentPreview(blob.url)
            setExpenseForm(prev => ({ ...prev, attachments: [blob.url] }))
        } catch (err) { console.error('Receipt upload failed:', err) }
        finally { setUploadingReceipt(false); e.target.value = '' }
    }

    const removeReceipt = async () => {
        if (attachmentPreview?.includes('vercel-storage')) {
            await deleteReceiptApi({ url: attachmentPreview }).catch(() => {})
        }
        setAttachmentPreview(null)
        setExpenseForm(prev => ({ ...prev, attachments: [] }))
    }

    const handleDeleteExpense = async (id) => {
        if (deleteConfirm === id) {
            await dispatch(deleteBudgetExpense({ id, month, year }))
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

    const handleBulkCurrencyUpdate = async (currency) => {
        await dispatch(bulkUpdateBudgetCurrency({ ids: selectedExpenses, currency, month, year }))
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
        const data = { ...categoryForm, budget: parseFloat(categoryForm.budget) || 0, rollover: !!categoryForm.rollover }
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
        setCategoryForm({ name: c.name, color: c.color, type: c.type, budget: c.budget?.toString() || '', icon: c.icon || '', rollover: !!c.rollover })
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
            if (!e.listOnly) {
                if (e.type === 'income') groups[d].totalIncome += e.amount
                else groups[d].totalExpense += e.amount
            }
        })
        return Object.entries(groups)
    }, [expenses])

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
        { id: 'lists', label: 'Lists', icon: faListAlt },
        { id: 'goals', label: 'Goals', icon: faCheckCircle },
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

    const formatCurrencyRaw = (v, currencyCode) => {
        const cur = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
        return `${cur.symbol}${(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    // Exchange rate state (lifted to parent so all tabs can use it)
    const [viewCurrency, setViewCurrency] = useState('')
    const [baseCurrencyLoaded, setBaseCurrencyLoaded] = useState(false)

    useEffect(() => {
        if (savedBaseCurrency && !baseCurrencyLoaded) {
            setViewCurrency(savedBaseCurrency === 'PHP' ? '' : savedBaseCurrency)
            setBaseCurrencyLoaded(true)
        }
    }, [savedBaseCurrency])

    const exchangeRates = useMemo(() => {
        const live = liveRates || {}
        const user = savedRates || {}
        const merged = { ...DEFAULT_EXCHANGE_RATES }
        CURRENCIES.forEach(c => {
            if (c.code === 'PHP') return
            if (live[c.code]) merged[c.code] = live[c.code]
        })
        Object.entries(user).forEach(([code, val]) => {
            if (val > 0) merged[code] = val
        })
        return merged
    }, [savedRates, liveRates])

    const activeViewCurrency = viewCurrency || 'PHP'

    const toTargetCurrency = (amount, fromCurrency, target) => {
        if (fromCurrency === target) return amount
        if (target === 'PHP') {
            if (fromCurrency === 'PHP') return amount
            const fromRate = exchangeRates[fromCurrency]
            return (fromRate && fromRate > 0) ? amount / fromRate : amount
        }
        const targetRate = exchangeRates[target]
        if (!targetRate || targetRate <= 0) return null
        if (fromCurrency === 'PHP') return amount * targetRate
        const fromRate = exchangeRates[fromCurrency]
        return (fromRate && fromRate > 0) ? (amount / fromRate) * targetRate : amount * targetRate
    }

    const formatCurrency = (v, currencyCode) => {
        const from = currencyCode || 'PHP'
        if (from === activeViewCurrency) return formatCurrencyRaw(v, activeViewCurrency)
        const converted = toTargetCurrency(v || 0, from, activeViewCurrency)
        if (converted !== null) return formatCurrencyRaw(converted, activeViewCurrency)
        return formatCurrencyRaw(v, from)
    }

    const monthlyBudgetData = useMemo(() => {
        const expenseCats = categories.filter(c => c.type === 'expense')
        return expenseCats.map(cat => {
            const spent = expenses
                .filter(e => e.category?._id === cat._id && e.type === 'expense' && !e.listOnly)
                .reduce((s, e) => {
                    const converted = toTargetCurrency(e.amount, e.currency || 'PHP', activeViewCurrency)
                    return s + (converted ?? e.amount)
                }, 0)
            const budget = toTargetCurrency(cat.budget || 0, 'PHP', activeViewCurrency) ?? (cat.budget || 0)
            const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0
            return { ...cat, spent, budget, remaining: budget - spent, percentage: pct }
        })
    }, [categories, expenses, activeViewCurrency, exchangeRates])

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
                                    <div className={`flex items-center gap-1 ml-1 pl-2 border-l border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`}>
                                        <FontAwesomeIcon icon={faExchangeAlt} className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                                        <select
                                            value={viewCurrency}
                                            onChange={e => setViewCurrency(e.target.value)}
                                            className={`text-[11px] font-semibold py-1 pl-1 pr-5 rounded-md border-0 cursor-pointer appearance-none bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500/30 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}
                                            title="View currency"
                                        >
                                            {CURRENCIES.map(c => {
                                                const val = c.code === 'PHP' ? '' : c.code
                                                const isDefault = c.code === (savedBaseCurrency || 'PHP')
                                                return <option key={c.code} value={val} className={isLight ? 'bg-white text-slate-700' : 'bg-[#1a1a1a] text-gray-200'}>{c.symbol} {c.code}{isDefault ? ' ★' : ''}</option>
                                            })}
                                        </select>
                                    </div>
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
                        {activeTab === 'dashboard' && <DashboardTab dashboard={dashboard} expenses={expenses} categories={categories} monthlyBudgetData={monthlyBudgetData} isLight={isLight} card={card} formatCurrency={formatCurrency} formatCurrencyRaw={formatCurrencyRaw} statusColor={statusColor} isLoading={isLoading} activeViewCurrency={activeViewCurrency} toTargetCurrency={toTargetCurrency} month={month} year={year} savings={savings} debts={debts} goals={goals} paymentIcon={paymentIcon} />}
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
                                handleBulkCurrencyUpdate={handleBulkCurrencyUpdate}
                                dispatch={dispatch} month={month} year={year} searchResults={searchResults}
                                attachmentPreview={attachmentPreview} setAttachmentPreview={setAttachmentPreview}
                                handleReceiptUpload={handleReceiptUpload} removeReceipt={removeReceipt}
                                uploadingReceipt={uploadingReceipt} setReceiptViewer={setReceiptViewer}
                                savedRates={savedRates} liveRates={liveRates} savedBaseCurrency={savedBaseCurrency}
                                viewCurrency={viewCurrency} setViewCurrency={setViewCurrency}
                                exchangeRates={exchangeRates} activeViewCurrency={activeViewCurrency}
                                toTargetCurrency={toTargetCurrency} formatCurrencyRaw={formatCurrencyRaw}
                            />
                        )}
                        {activeTab === 'monthly' && (
                            <MonthlyBudgetTab
                                monthlyBudgetData={monthlyBudgetData} dashboard={dashboard}
                                isLight={isLight} card={card} formatCurrency={formatCurrency} statusColor={statusColor}
                                month={month} year={year} isLoading={isLoading}
                                expenses={expenses} formatCurrencyRaw={formatCurrencyRaw}
                                activeViewCurrency={activeViewCurrency} toTargetCurrency={toTargetCurrency}
                                categories={categories} paymentIcon={paymentIcon}
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
                                dispatch={dispatch}
                            />
                        )}
                        {activeTab === 'savings' && (
                            <SavingsTab isLight={isLight} card={card} inputCls={inputCls} formatCurrency={formatCurrency} dispatch={dispatch} savings={savings} savingsHistory={savingsHistory} isLoading={isSavingsLoading} />
                        )}
                        {activeTab === 'debts' && (
                            <DebtTab
                                debts={debts} categories={categories} dispatch={dispatch} isLight={isLight} card={card}
                                inputCls={inputCls} selectCls={selectCls} btnPrimary={btnPrimary}
                                btnSecondary={btnSecondary} formatCurrency={formatCurrency} isLoading={isLoading}
                            />
                        )}
                        {activeTab === 'lists' && (
                            <ListsTab
                                budgetLists={budgetLists} dispatch={dispatch} isLight={isLight} card={card}
                                inputCls={inputCls} btnPrimary={btnPrimary} btnSecondary={btnSecondary}
                                isLoading={isLoading}
                            />
                        )}
                        {activeTab === 'goals' && (
                            <GoalsTab
                                goals={goals} categories={categories} dispatch={dispatch} isLight={isLight} card={card}
                                inputCls={inputCls} selectCls={selectCls} btnPrimary={btnPrimary}
                                btnSecondary={btnSecondary} formatCurrency={formatCurrency} isLoading={isLoading}
                            />
                        )}
                        {activeTab === 'summary' && (
                            <SummaryTab
                                dashboard={dashboard} expenses={expenses} categories={categories}
                                monthlyBudgetData={monthlyBudgetData} groupedByDate={groupedByDate}
                                month={month} year={year} isLight={isLight} card={card}
                                formatCurrency={formatCurrency} formatCurrencyRaw={formatCurrencyRaw}
                                statusColor={statusColor} paymentIcon={paymentIcon} isLoading={isLoading}
                                activeViewCurrency={activeViewCurrency} toTargetCurrency={toTargetCurrency}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Receipt Viewer Lightbox */}
            {receiptViewer && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setReceiptViewer(null)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 mb-3">
                            <a href={receiptViewer} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
                                <FontAwesomeIcon icon={faArrowRight} className="mr-1.5 text-[10px]" />
                                Open in new tab
                            </a>
                            <button onClick={() => setReceiptViewer(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
                                <FontAwesomeIcon icon={faTimes} className="mr-1.5 text-[10px]" />
                                Close
                            </button>
                        </div>
                        <img src={receiptViewer} alt="Receipt" className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain" />
                    </div>
                </div>
            )}
        </div>
    )
}

// ==================== DASHBOARD TAB ====================

const DashboardTab = ({ dashboard, expenses, categories, monthlyBudgetData, isLight, card, formatCurrency, formatCurrencyRaw, statusColor, isLoading, activeViewCurrency, toTargetCurrency, month, year, savings, debts, goals, paymentIcon }) => {
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
    const active = expenses.filter(e => !e.listOnly)
    const convert = (amt, cur) => toTargetCurrency(amt, cur || 'PHP', activeViewCurrency) ?? amt

    const totalIncome = active.filter(e => e.type === 'income').reduce((s, e) => s + convert(e.amount, e.currency), 0)
    const totalExpenses = active.filter(e => e.type === 'expense').reduce((s, e) => s + convert(e.amount, e.currency), 0)
    const balance = totalIncome - totalExpenses
    const totalBudget = monthlyBudgetData.reduce((s, c) => s + (c.budget || 0), 0)
    const remainingBudget = totalBudget - totalExpenses
    const balancePositive = balance >= 0
    const transactionCount = active.length
    const listOnlyCount = expenses.length - active.length
    const daysInMonth = new Date(year, month, 0).getDate()
    const dailyAvg = transactionCount > 0 ? totalExpenses / daysInMonth : 0

    const currencyBreakdown = useMemo(() => {
        const map = {}
        active.forEach(e => {
            const cur = e.currency || 'PHP'
            if (!map[cur]) map[cur] = { income: 0, expense: 0 }
            if (e.type === 'income') map[cur].income += e.amount
            else map[cur].expense += e.amount
        })
        return Object.entries(map).filter(([code]) => code !== activeViewCurrency)
    }, [active, activeViewCurrency])

    const topCategories = useMemo(() => {
        const catMap = {}
        active.filter(e => e.type === 'expense').forEach(e => {
            const catId = e.category?._id || 'uncategorized'
            const cat = categories.find(c => c._id === catId)
            if (!catMap[catId]) catMap[catId] = { id: catId, name: cat?.name || 'Uncategorized', color: cat?.color || '#94a3b8', icon: cat?.icon || '', amount: 0 }
            catMap[catId].amount += convert(e.amount, e.currency)
        })
        return Object.values(catMap).sort((a, b) => b.amount - a.amount).slice(0, 6)
    }, [active, categories, activeViewCurrency])

    const paymentMethods = useMemo(() => {
        const map = {}
        active.filter(e => e.type === 'expense').forEach(e => {
            const m = e.paymentMethod || 'Cash'
            if (!map[m]) map[m] = 0
            map[m] += convert(e.amount, e.currency)
        })
        return Object.entries(map).sort((a, b) => b[1] - a[1])
    }, [active, activeViewCurrency])

    const incomeSources = useMemo(() => {
        const catMap = {}
        active.filter(e => e.type === 'income').forEach(e => {
            const catId = e.category?._id || 'uncategorized'
            const cat = categories.find(c => c._id === catId)
            if (!catMap[catId]) catMap[catId] = { id: catId, name: cat?.name || 'Uncategorized', color: cat?.color || '#94a3b8', icon: cat?.icon || '', amount: 0 }
            catMap[catId].amount += convert(e.amount, e.currency)
        })
        return Object.values(catMap).sort((a, b) => b.amount - a.amount)
    }, [active, categories, activeViewCurrency])

    const [drilldown, setDrilldown] = useState(null)
    const [debtDrilldown, setDebtDrilldown] = useState(null)
    const [savingsDrilldown, setSavingsDrilldown] = useState(null)
    const [goalsDrilldown, setGoalsDrilldown] = useState(null)

    const drilldownItems = useMemo(() => {
        if (!drilldown) return []
        const src = drilldown.type === 'currency' ? expenses.filter(e => !e.listOnly) : active
        const items = src.filter(e => {
            if (drilldown.type === 'category') return e.type === 'expense' && (e.category?._id || 'uncategorized') === drilldown.id
            if (drilldown.type === 'payment') return e.type === 'expense' && (e.paymentMethod || 'Cash') === drilldown.id
            if (drilldown.type === 'income') return e.type === 'income' && (e.category?._id || 'uncategorized') === drilldown.id
            if (drilldown.type === 'budget') return e.type === 'expense' && (e.category?._id || 'uncategorized') === drilldown.id
            if (drilldown.type === 'currency') return (e.currency || 'PHP') === drilldown.id
            return false
        })
        return items.sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [drilldown, active, expenses])

    const budgetCategories = useMemo(() => monthlyBudgetData.filter(c => c.budget > 0), [monthlyBudgetData])

    const recentTransactions = useMemo(() =>
        [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    , [expenses])

    const topExpenses = useMemo(() =>
        active.filter(e => e.type === 'expense')
            .map(e => ({ ...e, converted: convert(e.amount, e.currency) }))
            .sort((a, b) => b.converted - a.converted)
            .slice(0, 5)
    , [active, activeViewCurrency])

    const savingsTotal = useMemo(() => {
        if (!savings || typeof savings !== 'object') return 0
        return Object.entries(savings).reduce((sum, [denom, count]) => sum + (parseInt(denom) || 0) * (parseInt(count) || 0), 0)
    }, [savings])

    const activeDebts = debts?.filter(d => d.amount_paid < d.total_amount) || []
    const totalOwed = activeDebts.filter(d => d.type === 'owe').reduce((s, d) => s + (d.total_amount - d.amount_paid), 0)
    const totalOwedToYou = activeDebts.filter(d => d.type === 'owed').reduce((s, d) => s + (d.total_amount - d.amount_paid), 0)
    const activeGoals = goals?.filter(g => g.currentAmount < g.targetAmount) || []
    const goalsTotalSaved = activeGoals.reduce((s, g) => s + (g.currentAmount || 0), 0)
    const goalsTotalTarget = activeGoals.reduce((s, g) => s + (g.targetAmount || 0), 0)
    const goalsOverallPct = goalsTotalTarget > 0 ? Math.round((goalsTotalSaved / goalsTotalTarget) * 100) : 0

    const summaryCards = [
        { label: 'Total Income', value: formatCurrencyRaw(totalIncome, activeViewCurrency), icon: faArrowUp, color: 'emerald' },
        { label: 'Total Expenses', value: formatCurrencyRaw(totalExpenses, activeViewCurrency), icon: faArrowDown, color: 'red' },
        { label: 'Balance', value: formatCurrencyRaw(balance, activeViewCurrency), icon: faWallet, color: balancePositive ? 'blue' : 'red' },
        { label: 'Remaining Budget', value: formatCurrencyRaw(remainingBudget, activeViewCurrency), icon: faChartPie, color: remainingBudget >= 0 ? 'emerald' : 'red' },
    ]

    const colorMap = {
        emerald: { icon: isLight ? 'text-emerald-600' : 'text-emerald-400', bg: isLight ? 'bg-emerald-50' : 'bg-emerald-900/20' },
        red: { icon: isLight ? 'text-red-600' : 'text-red-400', bg: isLight ? 'bg-red-50' : 'bg-red-900/20' },
        blue: { icon: isLight ? 'text-blue-600' : 'text-blue-400', bg: isLight ? 'bg-blue-50' : 'bg-blue-900/20' },
    }

    const budgetUsedPct = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0

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

            {/* Currency Breakdown */}
            {currencyBreakdown.length > 0 && (
                <div className={`${card} px-4 py-3`}>
                    <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={faExchangeAlt} className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                        <span className={`text-[11px] font-medium uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Raw Currency Totals</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {currencyBreakdown.map(([code, v]) => (
                            <div key={code} className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md cursor-pointer transition-colors ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'}`} onClick={() => setDrilldown({ type: 'currency', id: code, title: code, total: v.expense, income: v.income })}>
                                <span className={`font-bold ${isLight ? 'text-slate-500' : 'text-gray-300'}`}>{code}</span>
                                {v.income > 0 && <span className="text-emerald-500">+{formatCurrencyRaw(v.income, code)}</span>}
                                {v.expense > 0 && <span className="text-red-500">-{formatCurrencyRaw(v.expense, code)}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top Categories */}
                <div className={`${card} p-5`}>
                    <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Top Spending Categories</h3>
                    {topCategories.length > 0 ? (
                        <div className="space-y-3">
                            {topCategories.map((cat, i) => {
                                const pct = totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0
                                return (
                                    <div key={i} className={`cursor-pointer rounded-lg p-2 -mx-2 transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`} onClick={() => setDrilldown({ type: 'category', id: cat.id, title: cat.name, color: cat.color, icon: cat.icon, total: cat.amount })}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                                                    {cat.icon ? <SafeIcon name={cat.icon} cls="text-[10px]" style={{ color: cat.color }} /> : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />}
                                                </div>
                                                <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrencyRaw(cat.amount, activeViewCurrency)}</span>
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
                    {paymentMethods.length > 0 ? (
                        <div className="space-y-3">
                            {paymentMethods.map(([method, amount]) => (
                                <div key={method} className={`flex items-center justify-between cursor-pointer rounded-lg p-2 -mx-2 transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`} onClick={() => setDrilldown({ type: 'payment', id: method, title: method, total: amount })}>
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
                                    <span className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrencyRaw(amount, activeViewCurrency)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No payments recorded this month.</p>
                    )}
                </div>
            </div>

            {/* Income Sources + Budget Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Income Sources */}
                <div className={`${card} p-5`}>
                    <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Income Sources</h3>
                    {incomeSources.length > 0 ? (
                        <div className="space-y-3">
                            {incomeSources.map((cat, i) => {
                                const pct = totalIncome > 0 ? Math.round((cat.amount / totalIncome) * 100) : 0
                                return (
                                    <div key={i} className={`cursor-pointer rounded-lg p-2 -mx-2 transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`} onClick={() => setDrilldown({ type: 'income', id: cat.id, title: cat.name, color: cat.color, icon: cat.icon, total: cat.amount })}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                                                    {cat.icon ? <SafeIcon name={cat.icon} cls="text-[10px]" style={{ color: cat.color }} /> : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />}
                                                </div>
                                                <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrencyRaw(cat.amount, activeViewCurrency)}</span>
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
                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No income recorded this month.</p>
                    )}
                </div>

                {/* Budget Status per Category */}
                <div className={`${card} p-5`}>
                    <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Budget Status</h3>
                    {budgetCategories.length > 0 ? (
                        <div className="space-y-2.5">
                            {budgetCategories.map(cat => {
                                const sc = statusColor(cat.percentage)
                                return (
                                    <div key={cat._id} className={`cursor-pointer rounded-lg p-2 -mx-2 transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`} onClick={() => setDrilldown({ type: 'budget', id: cat._id, title: cat.name, color: cat.color, icon: cat.icon, total: cat.spent, budget: cat.budget, percentage: cat.percentage })}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                                                    {cat.icon ? <SafeIcon name={cat.icon} cls="text-[10px]" style={{ color: cat.color }} /> : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />}
                                                </div>
                                                <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatCurrencyRaw(cat.spent, activeViewCurrency)} / {formatCurrencyRaw(cat.budget, activeViewCurrency)}</span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${sc.text} ${sc.bg}`}>{cat.percentage}%</span>
                                            </div>
                                        </div>
                                        <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                            <div className={`h-full rounded-full transition-all duration-500 ${sc.bar}`} style={{ width: `${Math.min(cat.percentage, 100)}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No budgets set up.</p>
                    )}
                </div>
            </div>

            {/* Daily Spending Chart */}
            <div className={`${card} p-5`}>
                <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Daily Spending</h3>
                {d.dailyTotals && Object.keys(d.dailyTotals).length > 0 ? (
                    <DailyChart dailyTotals={d.dailyTotals} month={d.month} year={d.year} isLight={isLight} formatCurrency={formatCurrency} />
                ) : (
                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No daily data available.</p>
                )}
            </div>

            {/* Recent Transactions + Top Expenses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Transactions */}
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Recent Transactions</h3>
                    </div>
                    {recentTransactions.length > 0 ? (
                        <div className="divide-y divide-solid" style={{ borderColor: isLight ? '#f1f5f9' : '#1f1f1f' }}>
                            {recentTransactions.map(e => {
                                const converted = (e.currency || 'PHP') !== activeViewCurrency ? toTargetCurrency(e.amount, e.currency || 'PHP', activeViewCurrency) : null
                                return (
                                    <div key={e._id} className={`flex items-center gap-3 px-4 py-2.5 ${e.listOnly ? 'opacity-40' : ''}`}>
                                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (e.category?.color || '#94a3b8') + '20' }}>
                                            {e.category?.icon ? <SafeIcon name={e.category.icon} cls="text-[10px]" style={{ color: e.category.color }} /> : <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.category?.color || '#94a3b8' }} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-medium truncate ${e.listOnly ? 'line-through' : ''} ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                                {e.description}
                                                {e.listOnly && <span className={`ml-1 text-[8px] font-bold px-1 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#1a1a1a] text-gray-500'}`}>LIST</span>}
                                            </p>
                                            <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {e.category?.name || 'Uncategorized'}
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-xs font-semibold ${e.listOnly ? 'line-through' : ''} ${e.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {e.type === 'income' ? '+' : '-'}{converted !== null ? formatCurrencyRaw(converted, activeViewCurrency) : formatCurrencyRaw(e.amount, e.currency || 'PHP')}
                                            </p>
                                            {converted !== null && (
                                                <p className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatCurrencyRaw(e.amount, e.currency)}</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="p-5 text-center">
                            <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No transactions yet.</p>
                        </div>
                    )}
                </div>

                {/* Top Expenses */}
                <div className={`${card} overflow-hidden`}>
                    <div className={`px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                        <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Largest Expenses</h3>
                    </div>
                    {topExpenses.length > 0 ? (
                        <div className="divide-y divide-solid" style={{ borderColor: isLight ? '#f1f5f9' : '#1f1f1f' }}>
                            {topExpenses.map((e, i) => {
                                const pct = totalExpenses > 0 ? Math.round((e.converted / totalExpenses) * 100) : 0
                                return (
                                    <div key={e._id} className="flex items-center gap-3 px-4 py-2.5">
                                        <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#1a1a1a] text-gray-500'}`}>{i + 1}</span>
                                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (e.category?.color || '#94a3b8') + '20' }}>
                                            {e.category?.icon ? <SafeIcon name={e.category.icon} cls="text-[10px]" style={{ color: e.category.color }} /> : <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.category?.color || '#94a3b8' }} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{e.description}</p>
                                            <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {e.category?.name || 'Uncategorized'} · {pct}%
                                            </p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs font-semibold text-red-500">{formatCurrencyRaw(e.converted, activeViewCurrency)}</p>
                                            {(e.currency || 'PHP') !== activeViewCurrency && (
                                                <p className={`text-[9px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatCurrencyRaw(e.amount, e.currency)}</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="p-5 text-center">
                            <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No expenses recorded.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Savings / Debts / Goals Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`${card} p-4 cursor-pointer transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`} onClick={() => setSavingsDrilldown(true)}>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'}`}>
                            <FontAwesomeIcon icon={faPiggyBank} className={`text-sm ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                        </div>
                        <span className={`text-xs font-medium uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Savings</span>
                    </div>
                    <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{formatCurrency(savingsTotal)}</p>
                    <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Current balance</p>
                </div>

                <div className={`${card} p-4 cursor-pointer transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`} onClick={() => setDebtDrilldown(true)}>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-red-50' : 'bg-red-900/20'}`}>
                            <FontAwesomeIcon icon={faHandHoldingUsd} className={`text-sm ${isLight ? 'text-red-500' : 'text-red-400'}`} />
                        </div>
                        <span className={`text-xs font-medium uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Debts</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <div>
                            <p className="text-lg font-bold text-red-500">{formatCurrency(totalOwed)}</p>
                            <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>You owe</p>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-emerald-500">{formatCurrency(totalOwedToYou)}</p>
                            <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Owed to you</p>
                        </div>
                    </div>
                    <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{activeDebts.length} active</p>
                </div>

                <div className={`${card} p-4 cursor-pointer transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`} onClick={() => setGoalsDrilldown(true)}>
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-amber-50' : 'bg-amber-900/20'}`}>
                            <FontAwesomeIcon icon={faCheckCircle} className={`text-sm ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
                        </div>
                        <span className={`text-xs font-medium uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Goals</span>
                    </div>
                    <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{activeGoals.length} active</p>
                    {activeGoals.length > 0 && (
                        <>
                            <div className={`h-1.5 rounded-full overflow-hidden mt-2 ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.min(goalsOverallPct, 100)}%` }} />
                            </div>
                            <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{goalsOverallPct}% overall · {formatCurrency(goalsTotalSaved)} / {formatCurrency(goalsTotalTarget)}</p>
                        </>
                    )}
                </div>
            </div>

            {/* Monthly Overview */}
            <div className={`${card} p-5`}>
                <h3 className={`text-sm font-semibold mb-4 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Monthly Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center">
                        <p className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{transactionCount}</p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Transactions</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{formatCurrencyRaw(totalBudget, activeViewCurrency)}</p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Total Budget</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-xl sm:text-2xl font-bold ${totalBudget > 0 ? (budgetUsedPct > 100 ? 'text-red-500' : budgetUsedPct > 80 ? 'text-amber-500' : 'text-emerald-500') : (isLight ? 'text-slate-800' : 'text-white')}`}>
                            {totalBudget > 0 ? `${budgetUsedPct}%` : '—'}
                        </p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Budget Used</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            {transactionCount > 0 ? formatCurrencyRaw(dailyAvg, activeViewCurrency) : '—'}
                        </p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Daily Average</p>
                    </div>
                </div>

                {/* Additional details */}
                <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-3 pt-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                    <div className="text-center">
                        <p className={`text-lg font-bold text-emerald-500`}>{formatCurrencyRaw(totalIncome, activeViewCurrency)}</p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Total Income</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-lg font-bold text-red-500`}>{formatCurrencyRaw(totalExpenses, activeViewCurrency)}</p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Total Spent</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-lg font-bold ${remainingBudget >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrencyRaw(remainingBudget, activeViewCurrency)}</p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Budget Left</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{listOnlyCount > 0 ? listOnlyCount : '—'}</p>
                        <p className={`text-[11px] sm:text-xs mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>List Only</p>
                    </div>
                </div>

                {d.rolloverAmount > 0 && (
                    <div className={`mt-3 pt-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'} flex items-center gap-2`}>
                        <FontAwesomeIcon icon={faSyncAlt} className={`text-[10px] ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                        <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Budget rollover from last month: <span className="font-semibold">{formatCurrency(d.rolloverAmount)}</span></span>
                    </div>
                )}
            </div>

            {/* Drilldown Modal */}
            {drilldown && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setDrilldown(null)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl ${isLight ? 'bg-white' : 'bg-[#141414]'} border border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className={`flex items-center justify-between px-5 py-4 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'} flex-shrink-0`}>
                            <div className="flex items-center gap-3">
                                {drilldown.color && (
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: drilldown.color + '20' }}>
                                        {drilldown.icon ? <SafeIcon name={drilldown.icon} cls="text-sm" style={{ color: drilldown.color }} /> : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: drilldown.color }} />}
                                    </div>
                                )}
                                {drilldown.type === 'payment' && (
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                        <FontAwesomeIcon icon={
                                            drilldown.id === 'GCash' ? faMobileAlt :
                                            drilldown.id === 'Bank' ? faUniversity :
                                            ['Credit Card', 'Debit Card'].includes(drilldown.id) ? faCreditCard :
                                            faMoneyBillWave
                                        } className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-400'}`} />
                                    </div>
                                )}
                                {drilldown.type === 'currency' && (
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'}`}>
                                        <FontAwesomeIcon icon={faExchangeAlt} className={`text-sm ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                                    </div>
                                )}
                                <div>
                                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{drilldown.title}</h3>
                                    <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {drilldown.type === 'category' && 'Expense Breakdown'}
                                        {drilldown.type === 'payment' && 'Payment Method Breakdown'}
                                        {drilldown.type === 'income' && 'Income Breakdown'}
                                        {drilldown.type === 'budget' && 'Budget Breakdown'}
                                        {drilldown.type === 'currency' && 'Currency Breakdown'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setDrilldown(null)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#1f1f1f] text-gray-500'}`}>
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>

                        {/* Summary */}
                        <div className={`px-5 py-3 border-b border-solid ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#111]'} flex-shrink-0`}>
                            {drilldown.type === 'currency' ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {drilldown.income > 0 && (
                                            <div>
                                                <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Income</p>
                                                <p className="text-lg font-bold text-emerald-500">+{formatCurrencyRaw(drilldown.income, drilldown.id)}</p>
                                            </div>
                                        )}
                                        {drilldown.total > 0 && (
                                            <div>
                                                <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Expense</p>
                                                <p className="text-lg font-bold text-red-500">-{formatCurrencyRaw(drilldown.total, drilldown.id)}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Transactions</p>
                                        <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{drilldownItems.length}</p>
                                    </div>
                                </div>
                            ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {drilldown.type === 'budget' ? 'Spent / Budget' : 'Total'}
                                    </p>
                                    <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                        {formatCurrencyRaw(drilldown.total, activeViewCurrency)}
                                        {drilldown.type === 'budget' && <span className={`text-sm font-normal ${isLight ? 'text-slate-400' : 'text-gray-500'}`}> / {formatCurrencyRaw(drilldown.budget, activeViewCurrency)}</span>}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Transactions</p>
                                    <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{drilldownItems.length}</p>
                                </div>
                            </div>
                            )}
                            {drilldown.type === 'budget' && drilldown.percentage != null && (
                                <div className="mt-2">
                                    <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#1a1a1a]'}`}>
                                        <div className={`h-full rounded-full transition-all duration-500 ${drilldown.percentage > 100 ? 'bg-red-500' : drilldown.percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(drilldown.percentage, 100)}%` }} />
                                    </div>
                                    <p className={`text-[11px] mt-1 ${drilldown.percentage > 100 ? 'text-red-500' : drilldown.percentage > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {drilldown.percentage}% used
                                        {drilldown.percentage > 100 && ` (${formatCurrencyRaw(drilldown.total - drilldown.budget, activeViewCurrency)} over)`}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Items list */}
                        <div className="overflow-y-auto flex-1 min-h-0">
                            {drilldownItems.length > 0 ? (
                                <div className={`divide-y divide-solid ${isLight ? 'divide-slate-100' : 'divide-[#1f1f1f]'}`}>
                                    {drilldownItems.map(e => {
                                        const converted = (e.currency || 'PHP') !== activeViewCurrency ? toTargetCurrency(e.amount, e.currency || 'PHP', activeViewCurrency) : null
                                        const cat = categories.find(c => c._id === e.category?._id)
                                        return (
                                            <div key={e._id} className={`flex items-center gap-3 px-5 py-3 transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`}>
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (cat?.color || '#94a3b8') + '20' }}>
                                                    {cat?.icon ? <SafeIcon name={cat.icon} cls="text-[11px]" style={{ color: cat.color }} /> : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color || '#94a3b8' }} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{e.description || 'No description'}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        {drilldown.type !== 'payment' && e.paymentMethod && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#222] text-gray-400'}`}>{e.paymentMethod}</span>
                                                        )}
                                                        {drilldown.type === 'payment' && cat && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full`} style={{ backgroundColor: cat.color + '15', color: cat.color }}>{cat.name}</span>
                                                        )}
                                                        {drilldown.type === 'currency' && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${e.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{e.type === 'income' ? 'Income' : 'Expense'}</span>
                                                        )}
                                                        {drilldown.type === 'currency' && cat && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full`} style={{ backgroundColor: cat.color + '15', color: cat.color }}>{cat.name}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    {drilldown.type === 'currency' ? (
                                                        <>
                                                            <p className={`text-sm font-semibold ${e.type === 'income' ? 'text-emerald-500' : (isLight ? 'text-slate-700' : 'text-gray-200')}`}>
                                                                {e.type === 'income' ? '+' : ''}{formatCurrencyRaw(e.amount, e.currency)}
                                                            </p>
                                                            {converted !== null && (
                                                                <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatCurrencyRaw(converted, activeViewCurrency)}</p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                                                {converted !== null ? formatCurrencyRaw(converted, activeViewCurrency) : formatCurrencyRaw(e.amount, activeViewCurrency)}
                                                            </p>
                                                            {converted !== null && (
                                                                <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatCurrencyRaw(e.amount, e.currency)}</p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-10">
                                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No transactions found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Debt Drilldown Modal */}
            {debtDrilldown && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setDebtDrilldown(null)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl ${isLight ? 'bg-white' : 'bg-[#141414]'} border border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className={`flex items-center justify-between px-5 py-4 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'} flex-shrink-0`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-red-50' : 'bg-red-900/20'}`}>
                                    <FontAwesomeIcon icon={faHandHoldingUsd} className={`text-sm ${isLight ? 'text-red-500' : 'text-red-400'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Debts Breakdown</h3>
                                    <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{activeDebts.length} active debt{activeDebts.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <button onClick={() => setDebtDrilldown(null)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#1f1f1f] text-gray-500'}`}>
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>

                        {/* Summary */}
                        <div className={`px-5 py-3 border-b border-solid ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#111]'} flex-shrink-0`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>You Owe</p>
                                    <p className="text-lg font-bold text-red-500">{formatCurrency(totalOwed)}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Owed to You</p>
                                    <p className="text-lg font-bold text-emerald-500">{formatCurrency(totalOwedToYou)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Debts list */}
                        <div className="overflow-y-auto flex-1 min-h-0">
                            {activeDebts.length > 0 ? (
                                <div className={`divide-y divide-solid ${isLight ? 'divide-slate-100' : 'divide-[#1f1f1f]'}`}>
                                    {activeDebts.map(debt => {
                                        const remaining = debt.total_amount - debt.amount_paid
                                        const pct = debt.total_amount > 0 ? Math.round((debt.amount_paid / debt.total_amount) * 100) : 0
                                        const isOwe = debt.type === 'owe'
                                        const isOverdue = debt.due_date && new Date(debt.due_date) < new Date()
                                        return (
                                            <div key={debt._id} className={`px-5 py-3.5 transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`}>
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{debt.name}</p>
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${isOwe ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                                {isOwe ? 'YOU OWE' : 'OWES YOU'}
                                                            </span>
                                                            {isOverdue && (
                                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 flex-shrink-0">OVERDUE</span>
                                                            )}
                                                        </div>
                                                        {debt.person && <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{debt.person}</p>}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className={`text-sm font-bold ${isOwe ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrency(remaining)}</p>
                                                        <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>of {formatCurrency(debt.total_amount)}</p>
                                                    </div>
                                                </div>
                                                <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                                    <div className={`h-full rounded-full transition-all duration-500 ${isOwe ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                                <div className="flex items-center justify-between mt-1.5">
                                                    <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                        {pct}% paid · {formatCurrency(debt.amount_paid)} paid
                                                    </span>
                                                    {debt.due_date && (
                                                        <span className={`text-[10px] ${isOverdue ? 'text-amber-500' : (isLight ? 'text-slate-400' : 'text-gray-500')}`}>
                                                            Due {new Date(debt.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                                {debt.payments?.length > 0 && (
                                                    <div className={`mt-2 pt-2 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                                        <p className={`text-[10px] font-medium uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Payments ({debt.payments.length})</p>
                                                        <div className="space-y-1">
                                                            {debt.payments.slice(-3).map((p, i) => (
                                                                <div key={i} className="flex items-center justify-between">
                                                                    <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                        {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                        {p.notes && ` · ${p.notes}`}
                                                                    </span>
                                                                    <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{formatCurrency(p.amount)}</span>
                                                                </div>
                                                            ))}
                                                            {debt.payments.length > 3 && (
                                                                <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>+{debt.payments.length - 3} more</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-10">
                                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No active debts.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Savings Drilldown Modal */}
            {savingsDrilldown && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setSavingsDrilldown(null)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl shadow-2xl ${isLight ? 'bg-white' : 'bg-[#141414]'} border border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`} onClick={e => e.stopPropagation()}>
                        <div className={`flex items-center justify-between px-5 py-4 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'} flex-shrink-0`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-blue-50' : 'bg-blue-900/20'}`}>
                                    <FontAwesomeIcon icon={faPiggyBank} className={`text-sm ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Savings Breakdown</h3>
                                    <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Denomination count</p>
                                </div>
                            </div>
                            <button onClick={() => setSavingsDrilldown(null)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#1f1f1f] text-gray-500'}`}>
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>
                        <div className={`px-5 py-3 border-b border-solid ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#111]'} flex-shrink-0`}>
                            <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Total Balance</p>
                            <p className={`text-xl font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>{formatCurrency(savingsTotal)}</p>
                        </div>
                        <div className="overflow-y-auto flex-1 min-h-0">
                            {(() => {
                                const DENOMS = [
                                    { label: '₱1,000', value: 1000, type: 'bill' }, { label: '₱500', value: 500, type: 'bill' },
                                    { label: '₱200', value: 200, type: 'bill' }, { label: '₱100', value: 100, type: 'bill' },
                                    { label: '₱50', value: 50, type: 'bill' }, { label: '₱20', value: 20, type: 'coin' },
                                    { label: '₱10', value: 10, type: 'coin' }, { label: '₱5', value: 5, type: 'coin' },
                                    { label: '₱1', value: 1, type: 'coin' },
                                ]
                                const hasSavings = savings && Object.keys(savings).length > 0
                                const bills = DENOMS.filter(d => d.type === 'bill')
                                const coins = DENOMS.filter(d => d.type === 'coin')
                                const totalBills = bills.reduce((s, d) => s + (parseInt(savings?.[d.value]) || 0) * d.value, 0)
                                const totalCoins = coins.reduce((s, d) => s + (parseInt(savings?.[d.value]) || 0) * d.value, 0)
                                const renderGroup = (label, denoms, subtotal) => (
                                    <div className={`px-5 py-3`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className={`text-[10px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
                                            <p className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{formatCurrency(subtotal)}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            {denoms.map(d => {
                                                const count = parseInt(savings?.[d.value]) || 0
                                                const amount = count * d.value
                                                return (
                                                    <div key={d.value} className={`flex items-center justify-between py-1 ${count > 0 ? '' : 'opacity-30'}`}>
                                                        <div className="flex items-center gap-2.5">
                                                            <span className={`text-xs font-semibold w-14 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{d.label}</span>
                                                            <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>× {count}</span>
                                                        </div>
                                                        <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(amount)}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                                return hasSavings ? (
                                    <>
                                        {renderGroup('Bills', bills, totalBills)}
                                        <div className={`border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`} />
                                        {renderGroup('Coins', coins, totalCoins)}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center py-10">
                                        <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No savings recorded.</p>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Goals Drilldown Modal */}
            {goalsDrilldown && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setGoalsDrilldown(null)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl ${isLight ? 'bg-white' : 'bg-[#141414]'} border border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`} onClick={e => e.stopPropagation()}>
                        <div className={`flex items-center justify-between px-5 py-4 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'} flex-shrink-0`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-amber-50' : 'bg-amber-900/20'}`}>
                                    <FontAwesomeIcon icon={faCheckCircle} className={`text-sm ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Goals Breakdown</h3>
                                    <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <button onClick={() => setGoalsDrilldown(null)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#1f1f1f] text-gray-500'}`}>
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>
                        {activeGoals.length > 0 && (
                            <div className={`px-5 py-3 border-b border-solid ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#111]'} flex-shrink-0`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Overall Progress</p>
                                        <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{formatCurrency(goalsTotalSaved)} <span className={`text-sm font-normal ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>/ {formatCurrency(goalsTotalTarget)}</span></p>
                                    </div>
                                    <span className={`text-lg font-bold ${goalsOverallPct >= 100 ? 'text-emerald-500' : 'text-amber-500'}`}>{goalsOverallPct}%</span>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#1a1a1a]'}`}>
                                    <div className={`h-full rounded-full transition-all duration-500 ${goalsOverallPct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(goalsOverallPct, 100)}%` }} />
                                </div>
                            </div>
                        )}
                        <div className="overflow-y-auto flex-1 min-h-0">
                            {activeGoals.length > 0 ? (
                                <div className={`divide-y divide-solid ${isLight ? 'divide-slate-100' : 'divide-[#1f1f1f]'}`}>
                                    {activeGoals.map(goal => {
                                        const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0
                                        const remaining = goal.targetAmount - goal.currentAmount
                                        const isOverdue = goal.deadline && new Date(goal.deadline) < new Date()
                                        return (
                                            <div key={goal._id} className={`px-5 py-3.5 transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`}>
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: goal.color + '20' }}>
                                                            {goal.icon ? <SafeIcon name={goal.icon} cls="text-xs" style={{ color: goal.color }} /> : <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: goal.color }} />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className={`text-sm font-semibold truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{goal.name}</p>
                                                                {isOverdue && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 flex-shrink-0">OVERDUE</span>}
                                                            </div>
                                                            {goal.notes && <p className={`text-[11px] truncate mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{goal.notes}</p>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className={`text-sm font-bold`} style={{ color: goal.color }}>{pct}%</p>
                                                        <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatCurrency(remaining)} left</p>
                                                    </div>
                                                </div>
                                                <div className={`h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: goal.color }} />
                                                </div>
                                                <div className="flex items-center justify-between mt-1.5">
                                                    <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                                                    {goal.deadline && (
                                                        <span className={`text-[10px] ${isOverdue ? 'text-amber-500' : (isLight ? 'text-slate-400' : 'text-gray-500')}`}>
                                                            {isOverdue ? 'Was due' : 'Due'} {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                                {goal.contributions?.length > 0 && (
                                                    <div className={`mt-2 pt-2 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                                        <p className={`text-[10px] font-medium uppercase tracking-wider mb-1.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Contributions ({goal.contributions.length})</p>
                                                        <div className="space-y-1">
                                                            {goal.contributions.slice(-3).map((c, i) => (
                                                                <div key={i} className="flex items-center justify-between">
                                                                    <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                        {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                        {c.notes && ` · ${c.notes}`}
                                                                    </span>
                                                                    <span className={`text-[11px] font-semibold text-emerald-500`}>+{formatCurrency(c.amount)}</span>
                                                                </div>
                                                            ))}
                                                            {goal.contributions.length > 3 && (
                                                                <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>+{goal.contributions.length - 3} more</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-10">
                                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No active goals.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const DailyChart = ({ dailyTotals, month, year, isLight, formatCurrency }) => {
    const canvasRef = useRef(null)
    const daysInMonth = new Date(year, month, 0).getDate()
    const [tooltip, setTooltip] = useState(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const dpr = window.devicePixelRatio || 1
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        canvas.width = w * dpr
        canvas.height = h * dpr
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, w, h)

        let maxVal = 0
        for (let day = 1; day <= daysInMonth; day++) {
            const dt = dailyTotals[day]
            if (dt) {
                maxVal = Math.max(maxVal, dt.expense || 0, dt.income || 0)
            }
        }
        if (maxVal === 0) maxVal = 100

        const padding = { top: 10, right: 10, bottom: 24, left: 10 }
        const chartW = w - padding.left - padding.right
        const chartH = h - padding.top - padding.bottom
        const barW = Math.max(2, (chartW / daysInMonth) - 2)

        for (let day = 1; day <= daysInMonth; day++) {
            const dt = dailyTotals[day] || { income: 0, expense: 0 }
            const x = padding.left + ((day - 1) / daysInMonth) * chartW + 1

            const expH = (dt.expense / maxVal) * chartH
            ctx.fillStyle = isLight ? '#ef4444' : '#f87171'
            ctx.globalAlpha = 0.8
            ctx.fillRect(x, padding.top + chartH - expH, barW * 0.5, expH)

            const incH = (dt.income / maxVal) * chartH
            ctx.fillStyle = isLight ? '#10b981' : '#34d399'
            ctx.fillRect(x + barW * 0.5, padding.top + chartH - incH, barW * 0.5, incH)

            ctx.globalAlpha = 1
            if (day % 5 === 0 || day === 1) {
                ctx.fillStyle = isLight ? '#94a3b8' : '#6b7280'
                ctx.font = '9px sans-serif'
                ctx.textAlign = 'center'
                ctx.fillText(day.toString(), x + barW * 0.25, h - 6)
            }
        }
    }, [dailyTotals, daysInMonth, isLight])

    const handleMouse = (e) => {
        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const chartW = rect.width - 20
        const day = Math.floor(((x - 10) / chartW) * daysInMonth) + 1
        if (day >= 1 && day <= daysInMonth && dailyTotals[day]) {
            setTooltip({ day, ...dailyTotals[day], x: e.clientX - rect.left, y: e.clientY - rect.top })
        } else {
            setTooltip(null)
        }
    }

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                className="w-full cursor-crosshair"
                style={{ height: 140 }}
                onMouseMove={handleMouse}
                onMouseLeave={() => setTooltip(null)}
            />
            {tooltip && (
                <div className={`absolute z-10 px-2.5 py-1.5 rounded-lg text-xs shadow-lg pointer-events-none ${isLight ? 'bg-white border border-slate-200 text-slate-700' : 'bg-[#1a1a1a] border border-[#333] text-gray-200'}`} style={{ left: Math.min(tooltip.x, canvasRef.current.clientWidth - 120), top: tooltip.y - 50 }}>
                    <p className="font-semibold">Day {tooltip.day}</p>
                    {tooltip.expense > 0 && <p className="text-red-500">Expense: {formatCurrency(tooltip.expense)}</p>}
                    {tooltip.income > 0 && <p className="text-emerald-500">Income: {formatCurrency(tooltip.income)}</p>}
                </div>
            )}
            <div className="flex items-center justify-center gap-4 mt-1">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm" style={{backgroundColor: isLight ? '#ef4444' : '#f87171'}} /><span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Expense</span></div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-sm" style={{backgroundColor: isLight ? '#10b981' : '#34d399'}} /><span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Income</span></div>
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
    handleBulkCategoryUpdate, handleBulkCurrencyUpdate, dispatch, month, year, searchResults,
    attachmentPreview, setAttachmentPreview, handleReceiptUpload, removeReceipt,
    uploadingReceipt, setReceiptViewer,
    savedRates, liveRates, savedBaseCurrency,
    viewCurrency, setViewCurrency, exchangeRates, activeViewCurrency,
    toTargetCurrency, formatCurrencyRaw
}) => {
    const [filterDate, setFilterDate] = useState('')
    const [filterMethod, setFilterMethod] = useState('')
    const [filterCategory, setFilterCategory] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [showCSVImport, setShowCSVImport] = useState(false)
    const [csvData, setCsvData] = useState([])
    const searchTimeout = useRef(null)

    const [showRateEditor, setShowRateEditor] = useState(false)
    const [rateEditorValues, setRateEditorValues] = useState({})
    const [resetting, setResetting] = useState(false)

    const openRateEditor = () => {
        const vals = {}
        CURRENCIES.forEach(c => { if (c.code !== 'PHP') vals[c.code] = exchangeRates[c.code] || '' })
        setRateEditorValues(vals)
        setShowRateEditor(true)
    }

    const saveRateEditor = async () => {
        const rates = {}
        Object.entries(rateEditorValues).forEach(([code, val]) => {
            const num = parseFloat(val)
            if (num > 0) rates[code] = num
        })
        await dispatch(saveExchangeRates({ rates }))
        setShowRateEditor(false)
    }

    const handleResetRates = async () => {
        setResetting(true)
        const result = await dispatch(resetExchangeRates())
        setResetting(false)
        const freshLive = result.payload?.data?.result?.liveRates || liveRates || DEFAULT_EXCHANGE_RATES
        const vals = {}
        CURRENCIES.forEach(c => { if (c.code !== 'PHP') vals[c.code] = freshLive[c.code] || DEFAULT_EXCHANGE_RATES[c.code] || '' })
        setRateEditorValues(vals)
    }

    const convertAmount = (amount, fromCurrency) => {
        if (fromCurrency === activeViewCurrency) return null
        return toTargetCurrency(amount, fromCurrency, activeViewCurrency)
    }

    const handleSearch = (q) => {
        setSearchQuery(q)
        if (searchTimeout.current) clearTimeout(searchTimeout.current)
        if (q.length >= 2) {
            setIsSearching(true)
            searchTimeout.current = setTimeout(() => {
                dispatch(searchBudgetExpenses({ q }))
            }, 400)
        } else {
            setIsSearching(false)
            dispatch(clearSearchResults())
        }
    }

    const handleCSVFile = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const text = ev.target.result
            const lines = text.split('\n').filter(l => l.trim())
            if (lines.length < 2) return
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
            const rows = lines.slice(1).map(line => {
                const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
                const row = {}
                headers.forEach((h, i) => { row[h] = cols[i] || '' })
                return {
                    date: row.date || '',
                    description: row.description || row.name || row.item || '',
                    amount: row.amount || row.price || '0',
                    type: row.type || 'expense',
                    paymentMethod: row.paymentmethod || row['payment method'] || row.method || 'Cash',
                    notes: row.notes || '',
                }
            }).filter(r => r.description && parseFloat(r.amount))
            setCsvData(rows)
            setShowCSVImport(true)
        }
        reader.readAsText(file)
        e.target.value = ''
    }

    const handleCSVImport = async () => {
        if (csvData.length === 0) return
        await dispatch(importBudgetCSV({ rows: csvData, month, year }))
        setCsvData([])
        setShowCSVImport(false)
        dispatch(getBudgetDashboard({ month, year }))
    }

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
            if (!e.listOnly) {
                if (e.type === 'income') groups[d].totalIncome += e.amount
                else groups[d].totalExpense += e.amount
            }
        })
        return Object.entries(groups)
    }, [filtered])

    const allSelected = filtered.length > 0 && selectedExpenses.length === filtered.length
    const someSelected = selectedExpenses.length > 0

    const totalIncome = filtered.filter(e => e.type === 'income' && !e.listOnly).reduce((s, e) => s + e.amount, 0)
    const totalExpense = filtered.filter(e => e.type === 'expense' && !e.listOnly).reduce((s, e) => s + e.amount, 0)

    const hasMixedCurrencies = useMemo(() => {
        return filtered.some(e => (e.currency || 'PHP') !== activeViewCurrency)
    }, [filtered, activeViewCurrency])

    const convertedTotals = useMemo(() => {
        if (!hasMixedCurrencies && activeViewCurrency === 'PHP') return null
        let income = 0, expense = 0
        filtered.forEach(e => {
            if (e.listOnly) return
            const from = e.currency || 'PHP'
            const converted = toTargetCurrency(e.amount, from, activeViewCurrency)
            if (converted === null) return
            if (e.type === 'income') income += converted
            else expense += converted
        })
        return { income, expense, balance: income - expense }
    }, [filtered, activeViewCurrency, exchangeRates, hasMixedCurrencies])

    const convertGroupTotals = (items) => {
        const hasGroupMixed = items.some(e => (e.currency || 'PHP') !== activeViewCurrency)
        if (!hasGroupMixed && activeViewCurrency === 'PHP') return null
        let income = 0, expense = 0
        items.forEach(e => {
            if (e.listOnly) return
            const from = e.currency || 'PHP'
            const converted = toTargetCurrency(e.amount, from, activeViewCurrency)
            if (converted === null) return
            if (e.type === 'income') income += converted
            else expense += converted
        })
        return { income, expense }
    }

    const getCurrencyBreakdown = (items) => {
        const byCurrency = {}
        items.forEach(e => {
            if (e.listOnly) return
            const cur = e.currency || 'PHP'
            if (!byCurrency[cur]) byCurrency[cur] = { income: 0, expense: 0 }
            if (e.type === 'income') byCurrency[cur].income += e.amount
            else byCurrency[cur].expense += e.amount
        })
        return Object.entries(byCurrency).filter(([code]) => code !== activeViewCurrency).sort((a, b) => a[0].localeCompare(b[0]))
    }

    const overallBreakdown = useMemo(() => getCurrencyBreakdown(filtered), [filtered, activeViewCurrency])

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
                    <div className="flex-1 sm:block">
                        <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Income</p>
                        <p className="text-sm font-bold text-emerald-500">{convertedTotals ? formatCurrencyRaw(convertedTotals.income, activeViewCurrency) : formatCurrencyRaw(totalIncome, activeViewCurrency)}</p>
                        {overallBreakdown.filter(([, v]) => v.income > 0).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {overallBreakdown.filter(([, v]) => v.income > 0).map(([code, v]) => (
                                    <span key={code} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-900/20 text-emerald-400'}`}>
                                        {formatCurrencyRaw(v.income, code)}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className={`${card} px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-red-50' : 'bg-red-900/20'}`}>
                        <FontAwesomeIcon icon={faArrowDown} className="text-xs text-red-500" />
                    </div>
                    <div className="flex-1 sm:block">
                        <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Expenses</p>
                        <p className="text-sm font-bold text-red-500">{convertedTotals ? formatCurrencyRaw(convertedTotals.expense, activeViewCurrency) : formatCurrencyRaw(totalExpense, activeViewCurrency)}</p>
                        {overallBreakdown.filter(([, v]) => v.expense > 0).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {overallBreakdown.filter(([, v]) => v.expense > 0).map(([code, v]) => (
                                    <span key={code} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-red-50 text-red-600' : 'bg-red-900/20 text-red-400'}`}>
                                        {formatCurrencyRaw(v.expense, code)}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Currency Conversion Panel */}
            <div className={`${card} px-3 sm:px-4 py-3`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <FontAwesomeIcon icon={faExchangeAlt} className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                        <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>View in:</span>
                        <select
                            value={viewCurrency}
                            onChange={e => setViewCurrency(e.target.value)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs border border-solid outline-none cursor-pointer ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1a1a1a] border-[#333] text-gray-300'}`}
                        >
                            {CURRENCIES.map(c => {
                                const val = c.code === 'PHP' ? '' : c.code
                                const isDefault = c.code === (savedBaseCurrency || 'PHP')
                                return <option key={c.code} value={val}>{c.symbol} {c.code}{isDefault ? ' (Default)' : ''}</option>
                            })}
                        </select>
                        {activeViewCurrency !== (savedBaseCurrency || 'PHP') && (
                            <button
                                onClick={() => dispatch(saveExchangeRates({ rates: savedRates || {}, baseCurrency: activeViewCurrency }))}
                                className={`text-[10px] font-medium px-2 py-1 rounded-md transition-all ${isLight ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' : 'bg-blue-900/20 hover:bg-blue-900/30 text-blue-400'}`}
                            >
                                Set as default
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {activeViewCurrency !== 'PHP' && exchangeRates[activeViewCurrency] && (
                            <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                1 PHP = {exchangeRates[activeViewCurrency]} {activeViewCurrency}
                            </span>
                        )}
                        <button onClick={openRateEditor} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300'}`}>
                            <FontAwesomeIcon icon={faCogs} className="text-[10px]" />
                            Rates
                        </button>
                    </div>
                </div>
                {convertedTotals && (
                    <div className={`mt-2.5 pt-2.5 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            <div className={`px-3 py-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                                <p className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Income</p>
                                <p className="text-xs font-bold text-emerald-500">{formatCurrencyRaw(convertedTotals.income, activeViewCurrency)}</p>
                            </div>
                            <div className={`px-3 py-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                                <p className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Expenses</p>
                                <p className="text-xs font-bold text-red-500">{formatCurrencyRaw(convertedTotals.expense, activeViewCurrency)}</p>
                            </div>
                            <div className={`px-3 py-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                                <p className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Balance</p>
                                <p className={`text-xs font-bold ${convertedTotals.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrencyRaw(Math.abs(convertedTotals.balance), activeViewCurrency)}</p>
                            </div>
                        </div>
                        {overallBreakdown.length > 0 && (
                            <div className={`flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-dashed ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                {overallBreakdown.map(([code, v]) => (
                                    <div key={code} className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-md ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1a1a1a] text-gray-400'}`}>
                                        <span className={`font-bold ${isLight ? 'text-slate-500' : 'text-gray-300'}`}>{code}</span>
                                        {v.income > 0 && <span className="text-emerald-500">+{formatCurrencyRaw(v.income, code)}</span>}
                                        {v.expense > 0 && <span className="text-red-500">-{formatCurrencyRaw(v.expense, code)}</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeViewCurrency !== 'PHP' && !exchangeRates[activeViewCurrency] && (
                    <p className={`text-[11px] mt-2 ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                        No exchange rate set for {activeViewCurrency}. Click "Rates" to configure.
                    </p>
                )}
            </div>

            {/* Rate Editor Modal */}
            {showRateEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowRateEditor(false)}>
                    <div className="absolute inset-0 bg-black/50" />
                    <div className={`relative w-full max-w-md rounded-xl border border-solid shadow-xl ${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`} onClick={e => e.stopPropagation()}>
                        <div className={`flex items-center justify-between px-5 py-3.5 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>Exchange Rates (1 PHP = ?)</h3>
                            <button onClick={() => setShowRateEditor(false)} className={`w-7 h-7 rounded-md flex items-center justify-center ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#1f1f1f] text-gray-500'}`}>
                                <FontAwesomeIcon icon={faTimes} className="text-xs" />
                            </button>
                        </div>
                        <div className="px-5 py-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
                            {CURRENCIES.filter(c => c.code !== 'PHP').map(c => {
                                const liveVal = liveRates?.[c.code]
                                const currentVal = parseFloat(rateEditorValues[c.code])
                                const isCustom = liveVal && currentVal && Math.abs(currentVal - liveVal) > 0.000001
                                return (
                                    <div key={c.code} className="flex items-center gap-3">
                                        <div className={`flex items-center gap-1.5 w-28 flex-shrink-0`}>
                                            <span className={`text-sm font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{c.symbol}</span>
                                            <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{c.code}</span>
                                        </div>
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                step="0.000001"
                                                min="0"
                                                placeholder="0.000000"
                                                value={rateEditorValues[c.code] || ''}
                                                onChange={e => setRateEditorValues(prev => ({ ...prev, [c.code]: e.target.value }))}
                                                className={inputCls}
                                            />
                                            {isCustom && (
                                                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400'}`}>
                                                    custom
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className={`flex items-center justify-between gap-2 px-5 py-3.5 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            <button
                                onClick={handleResetRates}
                                disabled={resetting}
                                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-300'} disabled:opacity-50`}
                            >
                                <FontAwesomeIcon icon={faSyncAlt} className={`text-[10px] ${resetting ? 'animate-spin' : ''}`} />
                                {resetting ? 'Resetting...' : 'Reset to current rates'}
                            </button>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowRateEditor(false)} className={btnSecondary}>Cancel</button>
                                <button onClick={saveRateEditor} className={btnPrimary}>Save Rates</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search + CSV Import */}
            <div className={`${card} p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2`}>
                <div className="flex-1 relative">
                    <FontAwesomeIcon icon={faSearch} className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                    <input
                        type="text" placeholder="Search all transactions..." value={searchQuery}
                        onChange={e => handleSearch(e.target.value)}
                        className={`${inputCls} pl-8`}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg cursor-pointer transition-all ${isLight ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        <FontAwesomeIcon icon={faFileExport} className="text-[10px]" />
                        Import CSV
                        <input type="file" accept=".csv" className="hidden" onChange={handleCSVFile} />
                    </label>
                </div>
            </div>

            {/* Search Results */}
            {isSearching && searchResults.length > 0 && (
                <div className={`${card} p-4`}>
                    <h4 className={`text-xs font-semibold mb-3 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Search Results ({searchResults.length})</h4>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        {searchResults.slice(0, 20).map(e => (
                            <div key={e._id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#141414]'}`}>
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className={isLight ? 'text-slate-400' : 'text-gray-500'}>{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    <span className={`font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{e.description}</span>
                                </div>
                                <span className={`font-semibold whitespace-nowrap ${e.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>{e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CSV Import Preview */}
            {showCSVImport && csvData.length > 0 && (
                <div className={`${card} p-4`}>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>CSV Preview ({csvData.length} rows)</h4>
                        <div className="flex gap-2">
                            <button onClick={() => { setShowCSVImport(false); setCsvData([]) }} className={btnSecondary + ' !text-xs !px-3 !py-1.5'}>Cancel</button>
                            <button onClick={handleCSVImport} className={btnPrimary + ' !text-xs !px-3 !py-1.5'}>Import {csvData.length} rows</button>
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead><tr className={isLight ? 'text-slate-400' : 'text-gray-500'}><th className="text-left py-1 px-2">Date</th><th className="text-left py-1 px-2">Description</th><th className="text-right py-1 px-2">Amount</th><th className="text-left py-1 px-2">Type</th></tr></thead>
                            <tbody>
                                {csvData.slice(0, 10).map((r, i) => (
                                    <tr key={i} className={isLight ? 'text-slate-600' : 'text-gray-300'}>
                                        <td className="py-1 px-2">{r.date || '—'}</td>
                                        <td className="py-1 px-2 truncate max-w-[200px]">{r.description}</td>
                                        <td className="py-1 px-2 text-right">{r.amount}</td>
                                        <td className="py-1 px-2">{r.type}</td>
                                    </tr>
                                ))}
                                {csvData.length > 10 && <tr><td colSpan={4} className={`py-1 px-2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>...and {csvData.length - 10} more rows</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[11px] font-medium ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Currency:</span>
                                <select
                                    defaultValue=""
                                    onChange={e => { if (e.target.value) handleBulkCurrencyUpdate(e.target.value); e.target.value = '' }}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs border border-solid outline-none cursor-pointer ${isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#1a1a1a] border-[#333] text-gray-300'}`}
                                >
                                    <option value="" disabled>Select currency</option>
                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Currency</label>
                                <select value={expenseForm.currency || 'PHP'} onChange={e => setExpenseForm({...expenseForm, currency: e.target.value})} className={`${selectCls} w-full`}>
                                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Notes (optional)</label>
                                <input type="text" placeholder="Additional notes..." value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} className={inputCls} />
                            </div>
                        </div>

                        <div className={`mt-3 pt-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            <div className="flex items-center gap-4 mb-3">
                                <label className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${uploadingReceipt ? 'opacity-50 pointer-events-none' : 'cursor-pointer'} ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#1f1f1f] text-gray-300 hover:bg-[#2a2a2a]'}`}>
                                    <FontAwesomeIcon icon={uploadingReceipt ? faSyncAlt : faFileExport} className={`text-[10px] ${uploadingReceipt ? 'animate-spin' : ''}`} />
                                    {uploadingReceipt ? 'Uploading...' : attachmentPreview ? 'Change Receipt' : 'Attach Receipt'}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} disabled={uploadingReceipt} />
                                </label>
                                {attachmentPreview && (
                                    <div className="flex items-center gap-2">
                                        <img src={attachmentPreview} alt="receipt" className="w-10 h-10 rounded-md object-cover border border-solid border-slate-200/50 cursor-pointer" onClick={() => setReceiptViewer(attachmentPreview)} />
                                        <button onClick={removeReceipt} className={`text-[10px] ${isLight ? 'text-red-500' : 'text-red-400'}`}>
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-6 flex-wrap">
                                <label className={`flex items-center gap-2 cursor-pointer select-none`}>
                                    <input type="checkbox" checked={!!expenseForm.isRecurring} onChange={e => setExpenseForm({...expenseForm, isRecurring: e.target.checked})} className="w-4 h-4 rounded accent-blue-500 cursor-pointer" />
                                    <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>Recurring transaction</span>
                                </label>
                                <label className={`flex items-center gap-2 cursor-pointer select-none`}>
                                    <input type="checkbox" checked={!!expenseForm.listOnly} onChange={e => setExpenseForm({...expenseForm, listOnly: e.target.checked})} className="w-4 h-4 rounded accent-amber-500 cursor-pointer" />
                                    <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>List only (exclude from totals)</span>
                                </label>
                            </div>
                            {expenseForm.isRecurring && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Frequency</label>
                                        <select value={expenseForm.recurrenceRule || ''} onChange={e => setExpenseForm({...expenseForm, recurrenceRule: e.target.value})} className={`${selectCls} w-full`}>
                                            <option value="">Select frequency</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Bi-weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>End date (optional)</label>
                                        <input type="date" value={expenseForm.recurrenceEnd || ''} onChange={e => setExpenseForm({...expenseForm, recurrenceEnd: e.target.value})} className={inputCls} />
                                    </div>
                                </div>
                            )}
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
                                            {(() => {
                                                const cg = convertGroupTotals(group.items)
                                                const gb = getCurrencyBreakdown(group.items)
                                                return (
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
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{date}</span>
                                                                {gb.map(([code, v]) => {
                                                                    const net = v.income - v.expense
                                                                    if (v.income === 0 && v.expense === 0) return null
                                                                    return (
                                                                        <span key={code} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#1a1a1a] text-gray-400'}`}>
                                                                            {v.expense > 0 && <span className="text-red-500">-{formatCurrencyRaw(v.expense, code)}</span>}
                                                                            {v.income > 0 && v.expense > 0 && ' '}
                                                                            {v.income > 0 && <span className="text-emerald-500">+{formatCurrencyRaw(v.income, code)}</span>}
                                                                        </span>
                                                                    )
                                                                })}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 text-right">
                                                            <div className="flex items-center justify-end gap-3">
                                                                {(cg ? cg.income : group.totalIncome) > 0 && (
                                                                    <span className="text-[11px] font-semibold text-emerald-500">+{formatCurrencyRaw(cg ? cg.income : group.totalIncome, activeViewCurrency)}</span>
                                                                )}
                                                                {(cg ? cg.expense : group.totalExpense) > 0 && (
                                                                    <span className="text-[11px] font-semibold text-red-500">-{formatCurrencyRaw(cg ? cg.expense : group.totalExpense, activeViewCurrency)}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td />
                                                    </tr>
                                                )
                                            })()}
                                            {/* Expense rows */}
                                            {group.items.map(e => {
                                                const isSelected = selectedExpenses.includes(e._id)
                                                const converted = convertAmount(e.amount, e.currency || 'PHP')
                                                const targetSym = CURRENCIES.find(c => c.code === viewCurrency)?.symbol || ''
                                                return (
                                                    <tr
                                                        key={e._id}
                                                        className={`group transition-colors ${e.listOnly ? (isLight ? 'opacity-60' : 'opacity-50') : ''} ${isSelected ? (isLight ? 'bg-blue-50/60' : 'bg-blue-900/10') : (isLight ? 'hover:bg-slate-50/50' : 'hover:bg-[#111]')} border-b border-solid ${isLight ? 'border-slate-50' : 'border-[#1a1a1a]'}`}
                                                    >
                                                        <td className="px-4 py-2.5 text-center">
                                                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelectExpense(e._id)} className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-500" />
                                                        </td>
                                                        <td className={`px-3 py-2.5 text-xs whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                            {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <p className={`text-sm font-medium truncate max-w-[180px] ${e.listOnly ? 'line-through' : ''} ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{e.description}</p>
                                                                {e.listOnly && (
                                                                    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded ${isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400'}`}>
                                                                        <FontAwesomeIcon icon={faEye} className="text-[7px]" />
                                                                        LIST
                                                                    </span>
                                                                )}
                                                                {e.attachments?.length > 0 && (
                                                                    <button onClick={() => setReceiptViewer(e.attachments[0])} className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded transition-colors ${isLight ? 'bg-blue-50 text-blue-500 hover:bg-blue-100' : 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/40'}`} title="View receipt">
                                                                        <FontAwesomeIcon icon={faFileExport} className="text-[7px]" />
                                                                        RECEIPT
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {e.notes && <p className={`text-[11px] truncate max-w-[200px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{e.notes}</p>}
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-4.5 h-4.5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (e.category?.color || '#94a3b8') + '20' }}>
                                                                    {e.category?.icon ? <SafeIcon name={e.category.icon} cls="text-[9px]" style={{ color: e.category.color }} /> : <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.category?.color || '#94a3b8' }} />}
                                                                </div>
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
                                                            {converted !== null ? (
                                                                <>
                                                                    <span className={`text-sm font-semibold whitespace-nowrap ${e.listOnly ? (isLight ? 'text-slate-400 line-through' : 'text-gray-500 line-through') : (e.type === 'income' ? 'text-emerald-500' : 'text-red-500')}`}>
                                                                        {e.type === 'income' ? '+' : '-'}{formatCurrencyRaw(converted, activeViewCurrency)}
                                                                    </span>
                                                                    <span className={`block text-[10px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                        {e.type === 'income' ? '+' : '-'}{formatCurrencyRaw(e.amount, e.currency)}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className={`text-sm font-semibold whitespace-nowrap ${e.listOnly ? (isLight ? 'text-slate-400 line-through' : 'text-gray-500 line-through') : (e.type === 'income' ? 'text-emerald-500' : 'text-red-500')}`}>
                                                                    {e.type === 'income' ? '+' : '-'}{formatCurrencyRaw(e.amount, e.currency)}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right">
                                                            <div className="flex items-center justify-end gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={async () => {
                                                                        await dispatch(updateBudgetExpense({ id: e._id, date: e.date, description: e.description, category: e.category?._id || '', amount: e.amount, type: e.type, paymentMethod: e.paymentMethod, notes: e.notes || '', currency: e.currency || 'PHP', listOnly: !e.listOnly, attachments: e.attachments || [], isRecurring: !!e.isRecurring, recurrenceRule: e.recurrenceRule || '', recurrenceEnd: e.recurrenceEnd || '', month, year }))
                                                                        dispatch(getBudgetDashboard({ month, year }))
                                                                    }}
                                                                    title={e.listOnly ? 'Include in totals' : 'Exclude from totals (list only)'}
                                                                    className={`w-7 h-7 rounded-md flex items-center justify-center ${e.listOnly ? (isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400') : (isLight ? 'hover:bg-amber-50 text-slate-400' : 'hover:bg-amber-900/20 text-gray-500')}`}
                                                                >
                                                                    <FontAwesomeIcon icon={e.listOnly ? faEyeSlash : faEye} className="text-[10px]" />
                                                                </button>
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

const MonthlyBudgetTab = ({ monthlyBudgetData, dashboard, isLight, card, formatCurrency, statusColor, month, year, isLoading, expenses, formatCurrencyRaw, activeViewCurrency, toTargetCurrency, categories, paymentIcon }) => {
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`
    const [drilldown, setDrilldown] = useState(null)

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

    const totalBudget = monthlyBudgetData.reduce((s, c) => s + (c.budget || 0), 0)
    const totalSpent = monthlyBudgetData.reduce((s, c) => s + (c.spent || 0), 0)
    const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
    const overallStatus = statusColor(overallPct)

    const drilldownItems = useMemo(() => {
        if (!drilldown) return []
        const active = expenses.filter(e => !e.listOnly && e.type === 'expense')
        return active
            .filter(e => (e.category?._id || 'uncategorized') === drilldown._id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [drilldown, expenses])

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
                            <div key={cat._id} className={`${card} p-4 border-l-4 cursor-pointer transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`} style={{ borderLeftColor: cat.color }} onClick={() => setDrilldown(cat)}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                                            {cat.icon ? <SafeIcon name={cat.icon} cls="text-xs" style={{ color: cat.color }} /> : <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                                        </div>
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

            {/* Monthly Budget Drilldown Modal */}
            {drilldown && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setDrilldown(null)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className={`relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl shadow-2xl ${isLight ? 'bg-white' : 'bg-[#141414]'} border border-solid ${isLight ? 'border-slate-200' : 'border-[#2B2B2B]'}`} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className={`flex items-center justify-between px-5 py-4 border-b border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'} flex-shrink-0`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: drilldown.color + '20' }}>
                                    {drilldown.icon ? <SafeIcon name={drilldown.icon} cls="text-sm" style={{ color: drilldown.color }} /> : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: drilldown.color }} />}
                                </div>
                                <div>
                                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{drilldown.name}</h3>
                                    <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Budget Breakdown · {MONTHS[month - 1]} {year}</p>
                                </div>
                            </div>
                            <button onClick={() => setDrilldown(null)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#1f1f1f] text-gray-500'}`}>
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>

                        {/* Budget summary */}
                        <div className={`px-5 py-3 border-b border-solid ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#111]'} flex-shrink-0`}>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Spent / Budget</p>
                                    <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                        {formatCurrency(drilldown.spent)}
                                        <span className={`text-sm font-normal ${isLight ? 'text-slate-400' : 'text-gray-500'}`}> / {formatCurrency(drilldown.budget)}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Transactions</p>
                                    <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{drilldownItems.length}</p>
                                </div>
                            </div>
                            {drilldown.budget > 0 && (
                                <>
                                    <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-[#1a1a1a]'}`}>
                                        <div className={`h-full rounded-full transition-all duration-500 ${statusColor(drilldown.percentage).bar}`} style={{ width: `${Math.min(drilldown.percentage, 100)}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className={`text-[11px] ${statusColor(drilldown.percentage).text}`}>
                                            {drilldown.percentage}% used
                                            {drilldown.percentage > 100 && ` · ${formatCurrency(Math.abs(drilldown.remaining))} over`}
                                        </span>
                                        <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                            {drilldown.remaining >= 0 ? `${formatCurrency(drilldown.remaining)} left` : ''}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Expense list */}
                        <div className="overflow-y-auto flex-1 min-h-0">
                            {drilldownItems.length > 0 ? (
                                <div className={`divide-y divide-solid ${isLight ? 'divide-slate-100' : 'divide-[#1f1f1f]'}`}>
                                    {drilldownItems.map(e => {
                                        const converted = (e.currency || 'PHP') !== activeViewCurrency ? toTargetCurrency(e.amount, e.currency || 'PHP', activeViewCurrency) : null
                                        return (
                                            <div key={e._id} className={`flex items-center gap-3 px-5 py-3 transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1a1a1a]'}`}>
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: drilldown.color + '20' }}>
                                                    {drilldown.icon ? <SafeIcon name={drilldown.icon} cls="text-[11px]" style={{ color: drilldown.color }} /> : <div className="w-2 h-2 rounded-full" style={{ backgroundColor: drilldown.color }} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{e.description || 'No description'}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                        {e.paymentMethod && (
                                                            <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#222] text-gray-400'}`}>
                                                                <FontAwesomeIcon icon={paymentIcon(e.paymentMethod)} className="text-[8px]" />
                                                                {e.paymentMethod}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className={`text-sm font-semibold text-red-500`}>
                                                        -{converted !== null ? formatCurrencyRaw(converted, activeViewCurrency) : formatCurrencyRaw(e.amount, activeViewCurrency)}
                                                    </p>
                                                    {converted !== null && (
                                                        <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>-{formatCurrencyRaw(e.amount, e.currency)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-10">
                                    <p className={`text-sm ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No expenses in this category.</p>
                                </div>
                            )}
                        </div>
                    </div>
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
    btnSecondary, formatCurrency, emptyCategory, isLoading, dispatch
}) => {
    const [showIconPicker, setShowIconPicker] = useState(false)
    const [iconSearch, setIconSearch] = useState('')
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
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Icon</label>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setShowIconPicker(!showIconPicker)} className={`w-9 h-9 rounded-lg flex items-center justify-center border border-solid transition-all ${isLight ? 'bg-white border-slate-200 hover:border-blue-300' : 'bg-[#1a1a1a] border-[#333] hover:border-blue-500'}`}>
                                        {categoryForm.icon ? <SafeIcon name={categoryForm.icon} cls={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-300'}`} /> : <FontAwesomeIcon icon={faCircle} className={`text-xs ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />}
                                    </button>
                                    {categoryForm.icon && <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{categoryForm.icon}</span>}
                                </div>
                                {showIconPicker && (
                                    <div className={`mt-2 rounded-lg border border-solid overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#111] border-[#333]'}`}>
                                        <div className={`px-2 pt-2 pb-1.5`}>
                                            <input
                                                type="text"
                                                value={iconSearch}
                                                onChange={e => setIconSearch(e.target.value)}
                                                placeholder="Search icons..."
                                                className={`w-full px-2.5 py-1.5 rounded-md text-xs border border-solid outline-none ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-blue-300' : 'bg-[#1a1a1a] border-[#333] text-gray-200 placeholder:text-gray-600 focus:border-blue-500'}`}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="px-2 pb-2 max-h-36 overflow-y-auto grid grid-cols-8 gap-1">
                                            {!iconSearch && (
                                                <button onClick={() => { setCategoryForm({...categoryForm, icon: ''}); setShowIconPicker(false); setIconSearch('') }} className={`w-7 h-7 rounded flex items-center justify-center text-xs ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#222] text-gray-500'}`} title="None"><FontAwesomeIcon icon={faTimes} /></button>
                                            )}
                                            {ICON_GRID.filter(ic => !iconSearch || ic.includes(iconSearch.toLowerCase())).map(ic => (
                                                <button key={ic} onClick={() => { setCategoryForm({...categoryForm, icon: ic}); setShowIconPicker(false); setIconSearch('') }} className={`w-7 h-7 rounded flex items-center justify-center transition-all ${categoryForm.icon === ic ? (isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400') : (isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-[#222] text-gray-400')}`} title={ic}>
                                                    <SafeIcon name={ic} cls="text-xs" />
                                                </button>
                                            ))}
                                            {ICON_GRID.filter(ic => !iconSearch || ic.includes(iconSearch.toLowerCase())).length === 0 && (
                                                <p className={`col-span-8 text-center text-[11px] py-2 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No icons found</p>
                                            )}
                                        </div>
                                    </div>
                                )}
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
                            <div className="flex items-center gap-3 sm:col-span-2">
                                <label className={`flex items-center gap-2 cursor-pointer select-none`}>
                                    <input type="checkbox" checked={!!categoryForm.rollover} onChange={e => setCategoryForm({...categoryForm, rollover: e.target.checked})} className="w-4 h-4 rounded accent-blue-500 cursor-pointer" />
                                    <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>Enable budget rollover</span>
                                </label>
                                <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>(carry unspent budget to next month)</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => { setShowCategoryForm(false); setEditingCategory(null); setCategoryForm(emptyCategory); setShowIconPicker(false); setIconSearch('') }} className={btnSecondary}>Cancel</button>
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
                                    {cat.icon ? (
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                                            <SafeIcon name={cat.icon} cls="text-xs" style={{ color: cat.color }} />
                                        </div>
                                    ) : (
                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                    )}
                                    <div className="min-w-0">
                                        <span className={`text-sm font-medium block truncate ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{cat.name}</span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {cat.budget > 0 && (
                                                <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Budget: {formatCurrency(cat.budget)}/mo</span>
                                            )}
                                            {cat.rollover && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isLight ? 'bg-blue-50 text-blue-500' : 'bg-blue-900/20 text-blue-400'}`}><FontAwesomeIcon icon={faSyncAlt} className="mr-0.5 text-[8px]" />Rollover</span>
                                            )}
                                        </div>
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
                                    {cat.icon ? (
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                                            <SafeIcon name={cat.icon} cls="text-xs" style={{ color: cat.color }} />
                                        </div>
                                    ) : (
                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                    )}
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

// ==================== LISTS TAB ====================

const LIST_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#84cc16', '#f43f5e']

const LIST_CURRENCIES = [
    { symbol: '₱', label: 'PHP (₱)' },
    { symbol: '$', label: 'USD ($)' },
    { symbol: '€', label: 'EUR (€)' },
    { symbol: '£', label: 'GBP (£)' },
    { symbol: '¥', label: 'JPY (¥)' },
    { symbol: '₩', label: 'KRW (₩)' },
    { symbol: '₹', label: 'INR (₹)' },
    { symbol: '฿', label: 'THB (฿)' },
    { symbol: 'A$', label: 'AUD (A$)' },
    { symbol: 'C$', label: 'CAD (C$)' },
    { symbol: 'Fr', label: 'CHF (Fr)' },
    { symbol: 'R$', label: 'BRL (R$)' },
]

const formatListAmount = (v, list) => {
    const num = v || 0
    const show = list?.showCurrency !== false
    const sym = list?.currency || '₱'
    if (show) return `${sym}${num.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return Math.round(num).toLocaleString('en')
}

const LIST_ICONS = [
    'peso-sign','dollar-sign','money-bill-wave','coins','piggy-bank','wallet','credit-card','chart-line','chart-bar','calculator',
    'arrow-up','arrow-down','plus','minus','exchange-alt','hand-holding-usd','money-check-alt','receipt','file-invoice-dollar','cash-register',
    'shopping-cart','shopping-bag','store','tags','tag','box','gift','truck','home','building',
    'utensils','coffee','pizza-slice','hamburger','apple-alt','wine-glass','beer','ice-cream','cookie','bread-slice',
    'car','bus','plane','gas-pump','taxi','motorcycle','bicycle','subway','ship','helicopter',
    'tshirt','shoe-prints','glasses','hat-cowboy','gem','crown','ring','vest','mitten','socks',
    'laptop','desktop','mobile-alt','tablet-alt','keyboard','mouse','headphones','tv','gamepad','wifi',
    'book','graduation-cap','school','pencil-alt','pen','ruler','chalkboard','globe','microscope','flask',
    'heartbeat','medkit','pills','stethoscope','tooth','eye','brain','lungs','dumbbell','running',
    'bolt','lightbulb','fire','water','leaf','seedling','tree','sun','moon','cloud',
    'wrench','tools','hammer','screwdriver','paint-roller','paint-brush','broom','key','lock','shield-alt',
    'music','guitar','drum','microphone','film','camera','palette','theater-masks','puzzle-piece','dice',
    'baby','dog','cat','horse','fish','dove','paw','bone','star','heart',
    'bell','flag','bookmark','trophy','medal','award','phone','envelope','paper-plane','comments',
]

const SafeIcon = ({ name, cls, style }) => {
    if (!name || name === 'peso-sign') return <span className={cls} style={style}>₱</span>
    try { return <FontAwesomeIcon icon={['fas', name]} className={cls} style={style} /> }
    catch { return <FontAwesomeIcon icon={faCogs} className={`${cls} opacity-20`} style={style} /> }
}

const ListIconPicker = ({ value, onChange, isLight }) => {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const filtered = useMemo(() => {
        if (!search) return LIST_ICONS
        const q = search.toLowerCase()
        return LIST_ICONS.filter(n => n.includes(q))
    }, [search])

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => { setOpen(!open); setSearch('') }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-solid transition-all ${
                    open
                        ? (isLight ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-100' : 'border-blue-500 bg-blue-900/20 ring-1 ring-blue-900/30')
                        : (isLight ? 'border-slate-200 bg-white hover:border-slate-300' : 'border-[#333] bg-[#1a1a1a] hover:border-[#444]')
                }`}
            >
                <SafeIcon name={value} cls={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-300'}`} />
            </button>

            {open && (
                <div className={`absolute z-50 mt-1.5 left-0 rounded-xl border border-solid shadow-xl overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}
                    style={{ width: 'min(300px, calc(100vw - 3rem))' }}>
                    <div className={`px-3 py-2 border-b border-solid ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#1f1f1f] bg-[#111]'}`}>
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`} />
                            <input type="text" value={search} onChange={e => setSearch(e.target.value)} autoFocus
                                placeholder="Search icons..."
                                className={`w-full pl-7 pr-3 py-1.5 rounded-lg text-xs border border-solid outline-none ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-700' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-44 p-2">
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-8 gap-0.5">
                                {filtered.map(name => (
                                    <button key={name} type="button" title={name}
                                        onClick={() => { onChange(name); setOpen(false) }}
                                        className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                                            value === name
                                                ? (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')
                                                : (isLight ? 'text-slate-500 hover:bg-blue-50 hover:text-blue-600' : 'text-gray-400 hover:bg-blue-900/20 hover:text-blue-400')
                                        }`}>
                                        <SafeIcon name={name} cls="text-xs" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className={`text-center py-4 text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No icons found</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

const ListsTab = ({ budgetLists, dispatch, isLight, card, inputCls, btnPrimary, btnSecondary, isLoading }) => {
    const [showForm, setShowForm] = useState(false)
    const [editingList, setEditingList] = useState(null)
    const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6', icon: 'peso-sign', currency: '₱', showCurrency: true, items: [] })
    const [newItemName, setNewItemName] = useState('')
    const [newItemAmount, setNewItemAmount] = useState('')
    const [newItemType, setNewItemType] = useState('subtract')
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [expandedList, setExpandedList] = useState(null)
    const [editingItem, setEditingItem] = useState(null)
    const [editItemForm, setEditItemForm] = useState({ name: '', amount: '', type: 'subtract', notes: '' })

    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`

    useEffect(() => { dispatch(getBudgetLists()) }, [])

    const resetForm = () => {
        setForm({ name: '', description: '', color: '#3b82f6', icon: 'peso-sign', currency: '₱', showCurrency: true, items: [] })
        setEditingList(null)
        setShowForm(false)
        setNewItemName('')
        setNewItemAmount('')
        setNewItemType('subtract')
    }

    const openEdit = (list) => {
        setForm({
            name: list.name,
            description: list.description || '',
            color: list.color || '#3b82f6',
            icon: list.icon || 'peso-sign',
            currency: list.currency || '₱',
            showCurrency: list.showCurrency !== false,
            items: list.items?.map(i => ({ ...i })) || []
        })
        setEditingList(list._id)
        setShowForm(true)
    }

    const addItem = () => {
        if (!newItemName.trim()) return
        setForm(f => ({
            ...f,
            items: [...f.items, { name: newItemName.trim(), amount: parseFloat(newItemAmount) || 0, type: newItemType, checked: false, notes: '' }]
        }))
        setNewItemName('')
        setNewItemAmount('')
    }

    const removeItem = (idx) => {
        setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
    }

    const handleSubmit = async () => {
        if (!form.name.trim()) return
        if (editingList) {
            await dispatch(updateBudgetList({ id: editingList, ...form }))
        } else {
            await dispatch(createBudgetList(form))
        }
        resetForm()
    }

    const handleDelete = async (id) => {
        if (deleteConfirm === id) {
            await dispatch(deleteBudgetList(id))
            setDeleteConfirm(null)
            if (expandedList === id) setExpandedList(null)
        } else {
            setDeleteConfirm(id)
            setTimeout(() => setDeleteConfirm(null), 3000)
        }
    }

    const listPayload = (list, items) => ({ id: list._id, name: list.name, description: list.description, color: list.color, icon: list.icon, currency: list.currency, showCurrency: list.showCurrency, items })

    const toggleItemCheck = async (list, itemIdx) => {
        const updatedItems = list.items.map((it, i) => i === itemIdx ? { ...it, checked: !it.checked } : { ...it })
        await dispatch(updateBudgetList(listPayload(list, updatedItems)))
    }

    const startEditItem = (listId, itemIdx, item) => {
        setEditingItem({ listId, itemIdx })
        setEditItemForm({ name: item.name, amount: item.amount?.toString() || '0', type: item.type || 'subtract', notes: item.notes || '' })
    }

    const saveEditItem = async (list) => {
        if (!editingItem) return
        const updatedItems = list.items.map((it, i) =>
            i === editingItem.itemIdx
                ? { ...it, name: editItemForm.name, amount: parseFloat(editItemForm.amount) || 0, type: editItemForm.type, notes: editItemForm.notes }
                : { ...it }
        )
        await dispatch(updateBudgetList(listPayload(list, updatedItems)))
        setEditingItem(null)
    }

    const deleteItemFromList = async (list, itemIdx) => {
        const updatedItems = list.items.filter((_, i) => i !== itemIdx)
        await dispatch(updateBudgetList(listPayload(list, updatedItems)))
    }

    const quickAddItem = async (list, name, amount, type) => {
        if (!name.trim()) return
        const updatedItems = [...list.items.map(i => ({ ...i })), { name: name.trim(), amount: parseFloat(amount) || 0, type: type || 'subtract', checked: false, notes: '' }]
        await dispatch(updateBudgetList(listPayload(list, updatedItems)))
    }

    const getListStats = (list) => {
        const items = list.items || []
        const total = items.length
        const checked = items.filter(i => i.checked).length
        const addTotal = items.filter(i => (i.type || 'subtract') === 'add').reduce((s, i) => s + (i.amount || 0), 0)
        const subtractTotal = items.filter(i => (i.type || 'subtract') === 'subtract').reduce((s, i) => s + (i.amount || 0), 0)
        const net = addTotal - subtractTotal
        return { total, checked, addTotal, subtractTotal, net, pct: total > 0 ? Math.round((checked / total) * 100) : 0 }
    }

    if (isLoading && budgetLists.length === 0) {
        return (
            <div className="space-y-4">
                <div className={`${card} p-5`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`h-5 w-32 ${pulse}`} />
                        <div className={`h-8 w-24 rounded-lg ${pulse}`} />
                    </div>
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`${card} overflow-hidden`}>
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-8 h-8 rounded-lg ${pulse}`} />
                                <div className="flex-1 space-y-1.5">
                                    <div className={`h-4 w-36 ${pulse}`} />
                                    <div className={`h-2.5 w-48 ${pulse}`} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[...Array(3)].map((_, j) => <div key={j} className={`h-14 rounded-lg ${pulse}`} />)}
                            </div>
                        </div>
                        <div className={`border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className={`flex items-center gap-3 px-5 py-3 ${j > 0 ? `border-t border-solid ${isLight ? 'border-slate-50' : 'border-[#1a1a1a]'}` : ''}`}>
                                    <div className={`w-5 h-5 rounded ${pulse}`} />
                                    <div className={`h-3 flex-1 ${pulse}`} />
                                    <div className={`h-3 w-16 ${pulse}`} />
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
            {/* Header */}
            <div className={`${card} p-4 sm:p-5`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className={`text-sm sm:text-base font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Budget Lists</h2>
                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            {budgetLists.length} list{budgetLists.length !== 1 ? 's' : ''}
                            {budgetLists.length > 0 && (() => {
                                const allNet = budgetLists.reduce((s, l) => s + getListStats(l).net, 0)
                                return <> · Net: <span className={allNet >= 0 ? 'text-emerald-500' : 'text-red-500'}>{allNet >= 0 ? '+' : ''}{Math.round(allNet).toLocaleString('en')}</span></>
                            })()}
                        </p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true) }}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all ${isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                        New List
                    </button>
                </div>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className={`${card} p-4 sm:p-5`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                        {editingList ? 'Edit List' : 'New List'}
                    </h3>
                    <div className="space-y-3">
                        <input type="text" placeholder="List name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                        <input type="text" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />

                        {/* Icon & Color */}
                        <div className="flex gap-4">
                            <div>
                                <label className={`text-[11px] font-medium mb-1.5 block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Icon</label>
                                <ListIconPicker value={form.icon} onChange={v => setForm(f => ({ ...f, icon: v }))} isLight={isLight} />
                            </div>
                            <div className="flex-1">
                                <label className={`text-[11px] font-medium mb-1.5 block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Color</label>
                                <div className="flex gap-1.5 flex-wrap">
                                    {LIST_COLORS.map(c => (
                                        <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                                            className={`w-6 h-6 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                                            style={{ backgroundColor: c, ringColor: c, '--tw-ring-offset-color': isLight ? '#fff' : '#0e0e0e' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Currency */}
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <label className={`text-[11px] font-medium mb-1.5 block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Currency</label>
                                <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                                    className={`w-full px-3 py-2 rounded-lg text-xs border border-solid outline-none transition-all cursor-pointer ${isLight ? 'bg-white border-slate-200 focus:border-blue-400 text-slate-800' : 'bg-[#1a1a1a] border-[#333] focus:border-blue-500 text-gray-200'}`}>
                                    {LIST_CURRENCIES.map(c => <option key={c.symbol} value={c.symbol}>{c.label}</option>)}
                                </select>
                            </div>
                            <button type="button" onClick={() => setForm(f => ({ ...f, showCurrency: !f.showCurrency }))}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-solid transition-all ${
                                    form.showCurrency
                                        ? (isLight ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-900/20 border-blue-800/40 text-blue-400')
                                        : (isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#1a1a1a] border-[#333] text-gray-400')
                                }`}
                                title={form.showCurrency ? 'Currency visible — amounts show symbol and decimals' : 'Currency hidden — amounts show integers only'}
                            >
                                <FontAwesomeIcon icon={form.showCurrency ? faEye : faEyeSlash} className="text-[10px]" />
                                {form.showCurrency ? 'Shown' : 'Hidden'}
                            </button>
                        </div>

                        {/* Items */}
                        <div>
                            <label className={`text-[11px] font-medium mb-1.5 block ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Items ({form.items.length})</label>
                            {form.items.length > 0 && (
                                <div className={`rounded-lg border border-solid mb-2 divide-y ${isLight ? 'border-slate-200 divide-slate-100' : 'border-[#2B2B2B] divide-[#1f1f1f]'}`}>
                                    {form.items.map((item, idx) => {
                                        const t = item.type || 'subtract'
                                        return (
                                            <div key={idx} className="flex items-center gap-2.5 px-3 py-2">
                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${t === 'add' ? (isLight ? 'bg-emerald-50 text-emerald-500' : 'bg-emerald-900/20 text-emerald-400') : (isLight ? 'bg-red-50 text-red-500' : 'bg-red-900/20 text-red-400')}`}>
                                                    <SafeIcon name={form.icon || 'peso-sign'} cls="text-[10px] font-bold" />
                                                </div>
                                                <span className={`text-xs flex-1 min-w-0 truncate ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>{item.name}</span>
                                                <span className={`text-xs font-medium tabular-nums w-28 text-right flex-shrink-0 ${t === 'add' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {t === 'add' ? '+' : '-'}{formatListAmount(item.amount || 0, form)}
                                                </span>
                                                <button onClick={() => removeItem(idx)} className={`p-0.5 transition-colors flex-shrink-0 ${isLight ? 'text-slate-400 hover:text-red-500' : 'text-gray-500 hover:text-red-400'}`}>
                                                    <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <input type="text" placeholder="Item name" value={newItemName} onChange={e => setNewItemName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addItem()} className={`${inputCls} !w-auto flex-1 min-w-0 !py-1.5 !text-xs`} />
                                <input type="number" placeholder="Amount" value={newItemAmount} onChange={e => setNewItemAmount(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addItem()} className={`${inputCls} !w-28 !py-1.5 !text-xs`} />
                                <button
                                    onClick={() => setNewItemType(t => t === 'subtract' ? 'add' : 'subtract')}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all border border-solid ${
                                        newItemType === 'add'
                                            ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-900/20 border-emerald-800/40 text-emerald-400')
                                            : (isLight ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-900/20 border-red-800/40 text-red-400')
                                    }`}
                                    title={newItemType === 'add' ? 'Income (+)' : 'Expense (-)'}
                                >
                                    <FontAwesomeIcon icon={newItemType === 'add' ? faPlus : faMinus} className="text-[10px]" />
                                </button>
                                <button onClick={addItem} className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-gray-400'}`}>
                                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                            <button onClick={handleSubmit} className={btnPrimary}>
                                <FontAwesomeIcon icon={faCheck} className="text-xs mr-1.5" />
                                {editingList ? 'Update' : 'Create'}
                            </button>
                            <button onClick={resetForm} className={btnSecondary}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lists */}
            {budgetLists.length === 0 && !showForm ? (
                <div className={`${card} p-8 text-center`}>
                    <FontAwesomeIcon icon={faListAlt} className={`text-3xl mb-3 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                    <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>No lists yet</p>
                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Create a budget list to plan and track purchases, goals, or wishlists.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {budgetLists.map(list => {
                        const stats = getListStats(list)
                        const isExpanded = expandedList === list._id
                        return (
                            <div key={list._id} className={`${card} overflow-hidden`}>
                                <div className="relative">
                                    <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: list.color || '#3b82f6' }} />
                                    <div className="p-4 sm:p-5 pt-5 sm:pt-6">
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="min-w-0 flex-1 flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${list.color || '#3b82f6'}20` }}>
                                                    <SafeIcon name={list.icon || 'peso-sign'} cls="text-sm" style={{ color: list.color || '#3b82f6' }} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className={`text-sm font-bold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>{list.name}</h3>
                                                    {list.description && <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{list.description}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button onClick={() => openEdit(list)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#1f1f1f] text-gray-500'}`}>
                                                    <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                                </button>
                                                <button onClick={() => handleDelete(list._id)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${deleteConfirm === list._id ? 'bg-red-500 text-white' : (isLight ? 'hover:bg-red-50 text-slate-400 hover:text-red-500' : 'hover:bg-red-900/20 text-gray-500 hover:text-red-400')}`}>
                                                    <FontAwesomeIcon icon={deleteConfirm === list._id ? faCheck : faTrash} className="text-[10px]" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                            <div className={`rounded-lg p-2.5 sm:p-3 ${isLight ? 'bg-emerald-50/70' : 'bg-emerald-900/10'}`}>
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <FontAwesomeIcon icon={faArrowUp} className="text-[9px] text-emerald-500" />
                                                    <span className={`text-[10px] font-medium ${isLight ? 'text-emerald-600/70' : 'text-emerald-400/70'}`}>Income</span>
                                                </div>
                                                <p className="text-xs sm:text-sm font-bold text-emerald-500">{formatListAmount(stats.addTotal, list)}</p>
                                            </div>
                                            <div className={`rounded-lg p-2.5 sm:p-3 ${isLight ? 'bg-red-50/70' : 'bg-red-900/10'}`}>
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <FontAwesomeIcon icon={faArrowDown} className="text-[9px] text-red-500" />
                                                    <span className={`text-[10px] font-medium ${isLight ? 'text-red-600/70' : 'text-red-400/70'}`}>Expense</span>
                                                </div>
                                                <p className="text-xs sm:text-sm font-bold text-red-500">{formatListAmount(stats.subtractTotal, list)}</p>
                                            </div>
                                            <div className={`rounded-lg p-2.5 sm:p-3 ${isLight ? 'bg-slate-50' : 'bg-[#151515]'}`}>
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <FontAwesomeIcon icon={faWallet} className={`text-[9px] ${stats.net >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                                                    <span className={`text-[10px] font-medium ${isLight ? 'text-slate-500/70' : 'text-gray-400/70'}`}>Net</span>
                                                </div>
                                                <p className={`text-xs sm:text-sm font-bold ${stats.net >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {stats.net >= 0 ? '+' : ''}{formatListAmount(stats.net, list)}
                                                </p>
                                            </div>
                                        </div>

                                        {stats.total > 0 && (
                                            <div className="mt-3 flex items-center gap-3">
                                                <div className={`flex-1 h-1 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1f1f1f]'}`}>
                                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${stats.pct}%`, backgroundColor: list.color || '#3b82f6' }} />
                                                </div>
                                                <span className={`text-[10px] font-medium flex-shrink-0 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{stats.checked}/{stats.total} done</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Items table */}
                                <div className={`border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                    {list.items?.length > 0 ? (
                                        <>
                                            <div className={`divide-y ${isLight ? 'divide-slate-50' : 'divide-[#1a1a1a]'}`}>
                                                {(isExpanded ? list.items : list.items.slice(0, 5)).map((item, idx) => {
                                                    const itemType = item.type || 'subtract'
                                                    const isItemEditing = editingItem?.listId === list._id && editingItem?.itemIdx === idx
                                                    return (
                                                        <div key={idx} className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 group transition-colors ${item.checked ? (isLight ? 'bg-slate-50/50' : 'bg-[#0a0a0a]') : ''}`}>
                                                            <button onClick={() => toggleItemCheck(list, idx)}
                                                                className={`w-[18px] h-[18px] rounded flex items-center justify-center border border-solid transition-all flex-shrink-0 ${
                                                                    item.checked ? 'border-transparent text-white' : (isLight ? 'border-slate-300 hover:border-blue-400' : 'border-[#444] hover:border-blue-500')
                                                                }`}
                                                                style={item.checked ? { backgroundColor: list.color || '#3b82f6' } : {}}
                                                            >
                                                                {item.checked && <FontAwesomeIcon icon={faCheck} className="text-[8px]" />}
                                                            </button>

                                                            {isItemEditing ? (
                                                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                                                    <input type="text" value={editItemForm.name} onChange={e => setEditItemForm(f => ({ ...f, name: e.target.value }))}
                                                                        onKeyDown={e => e.key === 'Enter' && saveEditItem(list)} className={`${inputCls} !w-auto flex-1 min-w-0 !py-1.5 !text-xs`} autoFocus />
                                                                    <input type="number" value={editItemForm.amount} onChange={e => setEditItemForm(f => ({ ...f, amount: e.target.value }))}
                                                                        onKeyDown={e => e.key === 'Enter' && saveEditItem(list)} className={`${inputCls} !w-28 !py-1.5 !text-xs`} />
                                                                    <button
                                                                        onClick={() => setEditItemForm(f => ({ ...f, type: f.type === 'add' ? 'subtract' : 'add' }))}
                                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border border-solid ${
                                                                            editItemForm.type === 'add'
                                                                                ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-900/20 border-emerald-800/40 text-emerald-400')
                                                                                : (isLight ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-900/20 border-red-800/40 text-red-400')
                                                                        }`}
                                                                    >
                                                                        <FontAwesomeIcon icon={editItemForm.type === 'add' ? faPlus : faMinus} className="text-[9px]" />
                                                                    </button>
                                                                    <button onClick={() => saveEditItem(list)} className="text-emerald-500 hover:text-emerald-600 p-0.5 flex-shrink-0">
                                                                        <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                                    </button>
                                                                    <button onClick={() => setEditingItem(null)} className="text-red-400 hover:text-red-500 p-0.5 flex-shrink-0">
                                                                        <FontAwesomeIcon icon={faTimes} className="text-[10px]" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                                                                        itemType === 'add'
                                                                            ? (isLight ? 'bg-emerald-50 text-emerald-500' : 'bg-emerald-900/20 text-emerald-400')
                                                                            : (isLight ? 'bg-red-50 text-red-500' : 'bg-red-900/20 text-red-400')
                                                                    }`}>
                                                                        <SafeIcon name={list.icon || 'peso-sign'} cls="text-[10px] font-bold" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className={`text-xs block truncate transition-all ${item.checked ? 'line-through' : ''} ${isLight ? (item.checked ? 'text-slate-400' : 'text-slate-700') : (item.checked ? 'text-gray-500' : 'text-gray-200')}`}>
                                                                            {item.name}
                                                                        </span>
                                                                        {item.notes && <p className={`text-[10px] truncate ${isLight ? 'text-slate-400' : 'text-gray-600'}`}>{item.notes}</p>}
                                                                    </div>
                                                                    <span className={`text-xs font-semibold tabular-nums w-28 text-right flex-shrink-0 ${item.checked ? 'opacity-40 line-through' : ''} ${itemType === 'add' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                        {itemType === 'add' ? '+' : '-'}{formatListAmount(item.amount || 0, list)}
                                                                    </span>
                                                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                                        <button onClick={() => startEditItem(list._id, idx, item)} className={`w-6 h-6 rounded flex items-center justify-center ${isLight ? 'hover:bg-slate-100 text-slate-400' : 'hover:bg-[#1f1f1f] text-gray-500'}`}>
                                                                            <FontAwesomeIcon icon={faPen} className="text-[9px]" />
                                                                        </button>
                                                                        <button onClick={() => deleteItemFromList(list, idx)} className={`w-6 h-6 rounded flex items-center justify-center ${isLight ? 'hover:bg-red-50 text-slate-400 hover:text-red-500' : 'hover:bg-red-900/20 text-gray-500 hover:text-red-400'}`}>
                                                                            <FontAwesomeIcon icon={faTrash} className="text-[9px]" />
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            {list.items.length > 5 && (
                                                <button onClick={() => setExpandedList(isExpanded ? null : list._id)}
                                                    className={`w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-all border-t border-solid ${isLight ? 'border-slate-50 text-slate-400 hover:bg-slate-50 hover:text-slate-600' : 'border-[#1a1a1a] text-gray-500 hover:bg-[#111] hover:text-gray-300'}`}>
                                                    <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="text-[9px]" />
                                                    {isExpanded ? 'Show less' : `Show ${list.items.length - 5} more`}
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className={`px-5 py-4 text-center text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>No items — add one below</div>
                                    )}
                                    <QuickAddItem list={list} quickAddItem={quickAddItem} isLight={isLight} inputCls={inputCls} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const QuickAddItem = ({ list, quickAddItem, isLight, inputCls }) => {
    const [name, setName] = useState('')
    const [amount, setAmount] = useState('')
    const [type, setType] = useState('subtract')

    const handleAdd = async () => {
        if (!name.trim()) return
        await quickAddItem(list, name, amount, type)
        setName('')
        setAmount('')
    }

    return (
        <div className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 border-t border-solid ${isLight ? 'border-slate-100 bg-slate-50/30' : 'border-[#1f1f1f] bg-[#090909]'}`}>
            <input type="text" placeholder="Add item..." value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} className={`${inputCls} !w-auto flex-1 min-w-0 !py-1.5 !text-xs`} />
            <input type="number" placeholder="₱" value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} className={`${inputCls} !w-28 !py-1.5 !text-xs`} />
            <button onClick={() => setType(t => t === 'subtract' ? 'add' : 'subtract')}
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all border border-solid ${
                    type === 'add'
                        ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-900/20 border-emerald-800/40 text-emerald-400')
                        : (isLight ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-900/20 border-red-800/40 text-red-400')
                }`}
                title={type === 'add' ? 'Income (+)' : 'Expense (-)'}
            >
                <FontAwesomeIcon icon={type === 'add' ? faPlus : faMinus} className="text-[9px]" />
            </button>
            <button onClick={handleAdd} className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isLight ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
            </button>
        </div>
    )
}

// ==================== SUMMARY TAB ====================

const SummaryTab = ({ dashboard, expenses, categories, monthlyBudgetData, groupedByDate, month, year, isLight, card, formatCurrency, formatCurrencyRaw, statusColor, paymentIcon, isLoading, activeViewCurrency, toTargetCurrency }) => {
    const summaryRef = useRef(null)
    const [downloading, setDownloading] = useState(false)
    const [pdfError, setPdfError] = useState('')
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`

    const PDF_WIDTH = 800

    const handleDownloadPDF = async () => {
        if (!summaryRef.current || downloading) return
        setDownloading(true)

        const el = summaryRef.current
        const origWidth = el.style.width
        const origMinWidth = el.style.minWidth
        const origMaxWidth = el.style.maxWidth
        const origOverflow = el.style.overflow

        const scrollEls = el.querySelectorAll('.overflow-x-auto')
        const origScrollStyles = Array.from(scrollEls).map(s => ({ overflow: s.style.overflow, mx: s.style.marginLeft + '|' + s.style.marginRight, px: s.style.paddingLeft + '|' + s.style.paddingRight }))
        scrollEls.forEach(s => { s.style.overflow = 'visible'; s.style.marginLeft = '0'; s.style.marginRight = '0'; s.style.paddingLeft = '0'; s.style.paddingRight = '0' })

        try {
            el.style.width = `${PDF_WIDTH}px`
            el.style.minWidth = `${PDF_WIDTH}px`
            el.style.maxWidth = `${PDF_WIDTH}px`
            el.style.overflow = 'visible'

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
            el.style.overflow = origOverflow
            scrollEls.forEach((s, i) => { s.style.overflow = ''; s.style.marginLeft = ''; s.style.marginRight = ''; s.style.paddingLeft = ''; s.style.paddingRight = '' })

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
            setPdfError('PDF generation failed. Please try again.')
            setTimeout(() => setPdfError(''), 5000)
            el.style.width = origWidth
            el.style.minWidth = origMinWidth
            el.style.maxWidth = origMaxWidth
            el.style.overflow = origOverflow
            scrollEls.forEach(s => { s.style.overflow = ''; s.style.marginLeft = ''; s.style.marginRight = ''; s.style.paddingLeft = ''; s.style.paddingRight = '' })
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
    const convert = (amt, cur) => toTargetCurrency(amt, cur || 'PHP', activeViewCurrency) ?? amt
    const active = expenses.filter(e => !e.listOnly)
    const totalIncome = active.filter(e => e.type === 'income').reduce((s, e) => s + convert(e.amount, e.currency), 0)
    const totalExpenses = active.filter(e => e.type === 'expense').reduce((s, e) => s + convert(e.amount, e.currency), 0)
    const balance = totalIncome - totalExpenses
    const totalBudget = monthlyBudgetData.reduce((s, c) => s + (c.budget || 0), 0)
    const remainingBudget = totalBudget - totalExpenses
    const budgetUsedPct = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0
    const daysInMonth = new Date(year, month, 0).getDate()
    const dailyAvg = active.length > 0 ? totalExpenses / daysInMonth : 0

    const expenseCats = categories.filter(c => c.type === 'expense')
    const incomeCats = categories.filter(c => c.type === 'income')

    const catSpending = expenseCats.map(cat => {
        const spent = active.filter(e => e.category?._id === cat._id && e.type === 'expense').reduce((s, e) => s + convert(e.amount, e.currency), 0)
        return { ...cat, spent }
    }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent)

    const catIncome = incomeCats.map(cat => {
        const earned = active.filter(e => e.category?._id === cat._id && e.type === 'income').reduce((s, e) => s + convert(e.amount, e.currency), 0)
        return { ...cat, earned }
    }).filter(c => c.earned > 0).sort((a, b) => b.earned - a.earned)

    const paymentMap = {}
    active.filter(e => e.type === 'expense').forEach(e => {
        const m = e.paymentMethod || 'Cash'
        if (!paymentMap[m]) paymentMap[m] = 0
        paymentMap[m] += convert(e.amount, e.currency)
    })
    const sortedPayments = Object.entries(paymentMap).sort((a, b) => b[1] - a[1])

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

            {pdfError && (
                <div className={`rounded-lg p-3 mb-2 text-sm font-medium flex items-center gap-2 ${isLight ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-red-900/20 text-red-400 border border-red-800/50'}`}>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />
                    {pdfError}
                </div>
            )}

            {/* Printable Summary */}
            <div ref={summaryRef} className={`${card} overflow-hidden`}>
                {/* Header */}
                <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b border-solid ${isLight ? 'border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50' : 'border-[#1f1f1f] bg-gradient-to-r from-blue-900/10 to-indigo-900/10'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                Monthly Budget Summary
                            </h2>
                            <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                {MONTHS[month - 1]} {year}
                            </p>
                        </div>
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${isLight ? 'bg-white shadow-sm' : 'bg-[#1a1a1a]'}`}>
                            <FontAwesomeIcon icon={faWallet} className={`text-base sm:text-lg ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
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
                    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 px-3 sm:px-4 py-3 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-[#111]'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                            <span className={`text-[10px] sm:text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Transactions</span>
                            <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{active.length}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                            <span className={`text-[10px] sm:text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Total Budget</span>
                            <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(totalBudget)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                            <span className={`text-[10px] sm:text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Daily Avg</span>
                            <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{formatCurrency(dailyAvg)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                            <span className={`text-[10px] sm:text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Remaining</span>
                            <span className={`text-xs font-bold ${remainingBudget >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrencyRaw(remainingBudget, activeViewCurrency)}</span>
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
                                                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                                                        {cat.icon ? <SafeIcon name={cat.icon} cls="text-[8px]" style={{ color: cat.color }} /> : <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                                                    </div>
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
                                                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                                                        {cat.icon ? <SafeIcon name={cat.icon} cls="text-[8px]" style={{ color: cat.color }} /> : <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                                                    </div>
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
                            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                            <div className="overflow-hidden rounded-lg border border-solid min-w-[500px]" style={{ borderColor: isLight ? '#e2e8f0' : '#1f1f1f' }}>
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
                                                            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color + '20' }}>
                                                                {cat.icon ? <SafeIcon name={cat.icon} cls="text-[8px]" style={{ color: cat.color }} /> : <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />}
                                                            </div>
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
                                            <td className={`px-3 py-2 text-right font-bold ${remainingBudget >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrencyRaw(remainingBudget, activeViewCurrency)}</td>
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
                        </div>
                    )}

                    {/* Payment Methods */}
                    {sortedPayments.length > 0 && (
                        <div>
                            <h4 className={sectionTitle}>
                                <FontAwesomeIcon icon={faCreditCard} className="mr-1.5 text-indigo-400 text-[10px]" />
                                Payment Methods
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                            <div className="overflow-hidden rounded-lg border border-solid min-w-[550px]" style={{ borderColor: isLight ? '#e2e8f0' : '#1f1f1f' }}>
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
                                        {groupedByDate.map(([date, group]) => {
                                            const grpIncome = group.items.filter(e => !e.listOnly && e.type === 'income').reduce((s, e) => s + convert(e.amount, e.currency), 0)
                                            const grpExpense = group.items.filter(e => !e.listOnly && e.type === 'expense').reduce((s, e) => s + convert(e.amount, e.currency), 0)
                                            const grpCurrencies = {}
                                            group.items.filter(e => !e.listOnly).forEach(e => {
                                                const cur = e.currency || 'PHP'
                                                if (cur === activeViewCurrency) return
                                                if (!grpCurrencies[cur]) grpCurrencies[cur] = { income: 0, expense: 0 }
                                                if (e.type === 'income') grpCurrencies[cur].income += e.amount
                                                else grpCurrencies[cur].expense += e.amount
                                            })
                                            const grpCurrencyEntries = Object.entries(grpCurrencies)
                                            return (
                                            <React.Fragment key={date}>
                                                <tr className={isLight ? 'bg-slate-50/50' : 'bg-[#0a0a0a]'}>
                                                    <td colSpan={3} className={`px-3 py-1.5`}>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{date}</span>
                                                            {grpCurrencyEntries.map(([code, v]) => (
                                                                <span key={code} className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#1a1a1a] text-gray-400'}`}>
                                                                    {v.expense > 0 && <span className="text-red-500">-{formatCurrencyRaw(v.expense, code)}</span>}
                                                                    {v.income > 0 && v.expense > 0 && ' '}
                                                                    {v.income > 0 && <span className="text-emerald-500">+{formatCurrencyRaw(v.income, code)}</span>}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-1.5 text-right" colSpan={2}>
                                                        <div className="flex items-center justify-end gap-2">
                                                            {grpIncome > 0 && <span className="text-[10px] font-semibold text-emerald-500">+{formatCurrencyRaw(grpIncome, activeViewCurrency)}</span>}
                                                            {grpExpense > 0 && <span className="text-[10px] font-semibold text-red-500">-{formatCurrencyRaw(grpExpense, activeViewCurrency)}</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {group.items.map(e => {
                                                    const fromCur = e.currency || 'PHP'
                                                    const converted = fromCur !== activeViewCurrency ? toTargetCurrency(e.amount, fromCur, activeViewCurrency) : null
                                                    return (
                                                    <tr key={e._id} className={`border-t border-solid ${isLight ? 'border-slate-50' : 'border-[#1a1a1a]'} ${e.listOnly ? 'opacity-40' : ''}`}>
                                                        <td className={`px-3 py-1.5 whitespace-nowrap ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                            {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td className={`px-3 py-1.5 ${e.listOnly ? 'line-through' : ''} ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                                            {e.description}
                                                            {e.listOnly && <span className={`ml-1 text-[9px] font-bold px-1 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-400' : 'bg-[#1a1a1a] text-gray-500'}`}>LIST</span>}
                                                        </td>
                                                        <td className={`px-3 py-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (e.category?.color || '#94a3b8') + '20' }}>
                                                                    {e.category?.icon ? <SafeIcon name={e.category.icon} cls="text-[8px]" style={{ color: e.category.color }} /> : <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.category?.color || '#94a3b8' }} />}
                                                                </div>
                                                                {e.category?.name || 'Uncategorized'}
                                                            </div>
                                                        </td>
                                                        <td className={`px-3 py-1.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{e.paymentMethod}</td>
                                                        <td className={`px-3 py-1.5 text-right whitespace-nowrap`}>
                                                            {converted !== null ? (
                                                                <>
                                                                    <span className={`text-xs font-semibold ${e.listOnly ? 'line-through' : ''} ${e.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                        {e.type === 'income' ? '+' : '-'}{formatCurrencyRaw(converted, activeViewCurrency)}
                                                                    </span>
                                                                    <span className={`block text-[9px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                        {e.type === 'income' ? '+' : '-'}{formatCurrencyRaw(e.amount, fromCur)}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className={`text-xs font-semibold ${e.listOnly ? 'line-through' : ''} ${e.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                    {e.type === 'income' ? '+' : '-'}{formatCurrencyRaw(e.amount, fromCur)}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    )
                                                })}
                                            </React.Fragment>
                                            )
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className={`border-t-2 border-solid ${isLight ? 'border-slate-200 bg-slate-50' : 'border-[#2B2B2B] bg-[#111]'}`}>
                                            <td colSpan={4} className={`px-3 py-2 font-bold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>
                                                Net Total ({active.length} transactions)
                                            </td>
                                            <td className={`px-3 py-2 text-right font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {balance >= 0 ? '+' : ''}{formatCurrencyRaw(balance, activeViewCurrency)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pt-4 mt-2 border-t border-solid text-[10px] ${isLight ? 'border-slate-100 text-slate-300' : 'border-[#1f1f1f] text-gray-600'}`}>
                        <span>Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        <span>Budget Manager · {MONTHS[month - 1]} {year}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ==================== GOALS TAB ====================

const GoalsTab = ({ goals, categories, dispatch, isLight, card, inputCls, selectCls, btnPrimary, btnSecondary, formatCurrency, isLoading }) => {
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '', category: '', color: '#3b82f6', icon: 'bullseye', notes: '' })
    const [contribForm, setContribForm] = useState({ goalId: null, amount: '', notes: '' })
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const pulse = `animate-pulse rounded ${isLight ? 'bg-slate-200/70' : 'bg-[#1f1f1f]'}`

    useEffect(() => { dispatch(getFinancialGoals()) }, [])

    const resetForm = () => { setForm({ name: '', targetAmount: '', deadline: '', category: '', color: '#3b82f6', icon: 'bullseye', notes: '' }); setEditing(null); setShowForm(false) }

    const handleSubmit = async () => {
        if (!form.name || !form.targetAmount) return
        const data = { ...form, targetAmount: parseFloat(form.targetAmount) }
        if (editing) await dispatch(updateFinancialGoal({ ...data, id: editing }))
        else await dispatch(createFinancialGoal(data))
        resetForm()
    }

    const handleEdit = (g) => {
        setForm({ name: g.name, targetAmount: g.targetAmount.toString(), deadline: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : '', category: g.category?._id || '', color: g.color, icon: g.icon || 'bullseye', notes: g.notes || '' })
        setEditing(g._id)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (deleteConfirm === id) { await dispatch(deleteFinancialGoal(id)); setDeleteConfirm(null) }
        else { setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 3000) }
    }

    const handleContribute = async () => {
        if (!contribForm.goalId || !contribForm.amount) return
        await dispatch(addGoalContribution({ id: contribForm.goalId, amount: parseFloat(contribForm.amount), notes: contribForm.notes }))
        setContribForm({ goalId: null, amount: '', notes: '' })
    }

    const activeGoals = goals.filter(g => g.status === 'active')
    const completedGoals = goals.filter(g => g.status === 'completed')
    const totalTarget = activeGoals.reduce((s, g) => s + g.targetAmount, 0)
    const totalSaved = activeGoals.reduce((s, g) => s + g.currentAmount, 0)

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={`${card} p-5`}>
                        <div className={`h-4 w-32 mb-3 ${pulse}`} />
                        <div className={`h-3 rounded-full w-full ${pulse}`} />
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`${card} px-4 py-3 text-center`}>
                    <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Active Goals</p>
                    <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{activeGoals.length}</p>
                </div>
                <div className={`${card} px-4 py-3 text-center`}>
                    <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Total Saved</p>
                    <p className="text-lg font-bold text-emerald-500">{formatCurrency(totalSaved)}</p>
                </div>
                <div className={`${card} px-4 py-3 text-center`}>
                    <p className={`text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Total Target</p>
                    <p className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>{formatCurrency(totalTarget)}</p>
                </div>
            </div>

            {/* Add Goal */}
            <div className={`${card} p-5`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{editing ? 'Edit Goal' : 'Financial Goals'}</h3>
                    <button onClick={() => { if (showForm) resetForm(); else setShowForm(true) }} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${showForm ? (isLight ? 'bg-slate-100 text-slate-600' : 'bg-[#1f1f1f] text-gray-400') : (isLight ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white')}`}>
                        <FontAwesomeIcon icon={showForm ? faTimes : faPlus} className="text-[10px]" />
                        {showForm ? 'Cancel' : 'New Goal'}
                    </button>
                </div>

                {showForm && (
                    <div className={`p-4 rounded-lg mb-4 border border-solid ${isLight ? 'bg-slate-50/50 border-slate-200/60' : 'bg-[#141414] border-[#2B2B2B]'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Goal Name</label>
                                <input type="text" placeholder="e.g., Emergency Fund" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputCls} />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Target Amount</label>
                                <input type="number" placeholder="0.00" value={form.targetAmount} onChange={e => setForm({...form, targetAmount: e.target.value})} className={inputCls} min="0" step="0.01" />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Deadline (optional)</label>
                                <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className={inputCls} />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Category (optional)</label>
                                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={`${selectCls} w-full`}>
                                    <option value="">None</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {CATEGORY_COLORS.map(c => (
                                        <button key={c} onClick={() => setForm({...form, color: c})} className={`w-6 h-6 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-1 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={`block text-xs font-medium mb-1.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Notes</label>
                                <input type="text" placeholder="Optional notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={inputCls} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={resetForm} className={btnSecondary}>Cancel</button>
                            <button onClick={handleSubmit} className={btnPrimary} disabled={!form.name || !form.targetAmount}>
                                <FontAwesomeIcon icon={editing ? faCheck : faPlus} className="mr-1.5 text-xs" />
                                {editing ? 'Update' : 'Create Goal'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Active Goals */}
            {activeGoals.length > 0 && (
                <div className="space-y-3">
                    {activeGoals.map(g => {
                        const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0
                        const barColor = pct >= 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                        const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / 86400000) : null
                        return (
                            <div key={g._id} className={`${card} p-5 border-l-4`} style={{ borderLeftColor: g.color }}>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: g.color + '20' }}>
                                            <SafeIcon name={g.icon || 'bullseye'} cls="text-sm" style={{ color: g.color }} />
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{g.name}</h4>
                                            <div className="flex items-center gap-2 text-[11px]">
                                                {g.category && <span className={isLight ? 'text-slate-400' : 'text-gray-500'}>{g.category.name}</span>}
                                                {daysLeft !== null && (
                                                    <span className={daysLeft < 0 ? 'text-red-500' : daysLeft < 30 ? 'text-amber-500' : (isLight ? 'text-slate-400' : 'text-gray-500')}>
                                                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={() => handleEdit(g)} className={`w-7 h-7 rounded-md flex items-center justify-center ${isLight ? 'hover:bg-blue-100 text-blue-500' : 'hover:bg-blue-900/30 text-blue-400'}`}>
                                            <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                        </button>
                                        <button onClick={() => handleDelete(g._id)} className={`w-7 h-7 rounded-md flex items-center justify-center ${deleteConfirm === g._id ? (isLight ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400') : (isLight ? 'hover:bg-red-100 text-red-500' : 'hover:bg-red-900/30 text-red-400')}`}>
                                            <FontAwesomeIcon icon={deleteConfirm === g._id ? faExclamationTriangle : faTrash} className="text-[10px]" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-1.5 text-xs">
                                    <span className={isLight ? 'text-slate-500' : 'text-gray-400'}>{formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}</span>
                                    <span className={`font-bold ${pct >= 100 ? 'text-emerald-500' : (isLight ? 'text-slate-600' : 'text-gray-300')}`}>{pct}%</span>
                                </div>
                                <div className={`h-2.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-[#1a1a1a]'}`}>
                                    <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                                </div>

                                {/* Contribute */}
                                <div className="flex items-center gap-2 mt-3">
                                    {contribForm.goalId === g._id ? (
                                        <>
                                            <input type="number" placeholder="Amount" value={contribForm.amount} onChange={e => setContribForm({...contribForm, amount: e.target.value})} className={`${inputCls} flex-1 !py-1.5`} min="0" step="0.01" />
                                            <button onClick={handleContribute} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isLight ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white'}`} disabled={!contribForm.amount}>Add</button>
                                            <button onClick={() => setContribForm({ goalId: null, amount: '', notes: '' })} className={`px-2 py-1.5 rounded-lg text-xs ${isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#1f1f1f]'}`}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => setContribForm({ goalId: g._id, amount: '', notes: '' })} className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isLight ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30'}`}>
                                            <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                                            Add Funds
                                        </button>
                                    )}
                                </div>

                                {g.contributions?.length > 0 && (
                                    <div className={`mt-3 pt-3 border-t border-solid ${isLight ? 'border-slate-100' : 'border-[#1f1f1f]'}`}>
                                        <p className={`text-[11px] font-semibold mb-1.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Recent contributions</p>
                                        <div className="space-y-1">
                                            {g.contributions.slice(-3).reverse().map((c, i) => (
                                                <div key={i} className="flex items-center justify-between text-xs">
                                                    <span className={isLight ? 'text-slate-500' : 'text-gray-400'}>{new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    <span className="font-semibold text-emerald-500">+{formatCurrency(c.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <div className={`${card} p-5`}>
                    <h4 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Completed ({completedGoals.length})</h4>
                    <div className="space-y-2">
                        {completedGoals.map(g => (
                            <div key={g._id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${isLight ? 'bg-emerald-50/50' : 'bg-emerald-900/10'}`}>
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-xs" />
                                    <span className={`text-sm ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{g.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-emerald-500">{formatCurrency(g.currentAmount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {goals.length === 0 && !showForm && (
                <div className={`${card} p-8 text-center`}>
                    <FontAwesomeIcon icon={faCheckCircle} className={`text-3xl mb-3 ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                    <p className={`text-sm font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>No financial goals yet</p>
                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Create goals to track your savings progress.</p>
                </div>
            )}
        </div>
    )
}

export default Budget
