import React, { useEffect, useState, useMemo } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getUserVideos } from '../../../actions/videos';
import { getTags } from '../../../actions/tags';
import { getCategory } from '../../../actions/category';
import { getAuthor } from '../../../actions/author';
import { getAllUsers } from '../../../actions/manageUsers';
import { getBudgetDashboard, getBudgetCategories, getBudgetExpenses, getDebts, getBudgetSavings, getFinancialGoals } from '../../../actions/budget';
import { getNotifications, getUnreadCount } from '../../../actions/notification';
import { getPortfolio } from '../../../actions/portfolio';
import { fetchGames } from '../../../actions/gameManager';
import { getProjects } from '../../../actions/project';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faVideo, faTag, faFolder, faEye, faUsers, faUserShield, faGavel, faBan, faCircleCheck, faShieldHalved,
    faWallet, faBriefcase, faBell, faExclamationTriangle, faLightbulb, faArrowRight, faChartLine, faPiggyBank, faCreditCard,
    faBullseye, faHeart, faComment, faUserPlus, faAt, faThumbsUp, faGamepad, faProjectDiagram,
    faSort, faSortUp, faSortDown, faSearch, faChevronLeft, faChevronRight, faReceipt,
    faStar, faFire, faTrophy, faRocket, faGlobe, faImage, faLink, faCode,
    faArrowUp, faArrowDown, faMinus, faCircle
} from '@fortawesome/free-solid-svg-icons';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS = { like: faHeart, comment: faComment, reply: faComment, subscribe: faUserPlus, mention: faAt, system: faBell }
const TYPE_COLORS = { like: 'text-rose-500', comment: 'text-blue-500', reply: 'text-emerald-500', subscribe: 'text-violet-500', mention: 'text-amber-500', system: 'text-gray-400' }

const CATEGORY_COLORS = [
    { bg: 'bg-blue-100', text: 'text-blue-700', darkBg: 'bg-blue-900/30', darkText: 'text-blue-400' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', darkBg: 'bg-emerald-900/30', darkText: 'text-emerald-400' },
    { bg: 'bg-violet-100', text: 'text-violet-700', darkBg: 'bg-violet-900/30', darkText: 'text-violet-400' },
    { bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'bg-amber-900/30', darkText: 'text-amber-400' },
    { bg: 'bg-rose-100', text: 'text-rose-700', darkBg: 'bg-rose-900/30', darkText: 'text-rose-400' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', darkBg: 'bg-cyan-900/30', darkText: 'text-cyan-400' },
    { bg: 'bg-pink-100', text: 'text-pink-700', darkBg: 'bg-pink-900/30', darkText: 'text-pink-400' },
    { bg: 'bg-teal-100', text: 'text-teal-700', darkBg: 'bg-teal-900/30', darkText: 'text-teal-400' },
]

const getCategoryColor = (name, isLight) => {
    const idx = Math.abs([...name].reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)) % CATEGORY_COLORS.length
    const c = CATEGORY_COLORS[idx]
    return isLight ? `${c.bg} ${c.text}` : `${c.darkBg} ${c.darkText}`
}

const MiniTable = ({ theme, icon, iconColor, title, subtitle, badge, columns, data, onRowClick, emptyIcon, emptyText, perPage = 5, striped = false }) => {
    const isLight = theme === 'light'
    const [page, setPage] = useState(0)
    const [sortKey, setSortKey] = useState(null)
    const [sortDir, setSortDir] = useState('asc')
    const [search, setSearch] = useState('')

    const filtered = useMemo(() => {
        if (!search.trim()) return data
        const q = search.toLowerCase()
        return data.filter(row => columns.some(col => String(col.value ? col.value(row) : row[col.key] || '').toLowerCase().includes(q)))
    }, [data, search, columns])

    const sorted = useMemo(() => {
        if (!sortKey) return filtered
        const col = columns.find(c => c.key === sortKey)
        return [...filtered].sort((a, b) => {
            const av = col?.value ? col.value(a) : a[sortKey]
            const bv = col?.value ? col.value(b) : b[sortKey]
            if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av
            return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
        })
    }, [filtered, sortKey, sortDir, columns])

    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
    const pageData = sorted.slice(page * perPage, (page + 1) * perPage)

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        else { setSortKey(key); setSortDir('asc') }
    }

    const thClass = `text-[11px] font-semibold uppercase tracking-wider px-3 py-3 text-left cursor-pointer select-none transition-colors whitespace-nowrap ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-gray-500 hover:text-gray-300'}`
    const tdClass = `px-3 py-3 text-sm ${isLight ? 'text-slate-600' : 'text-gray-300'}`

    return (
        <div className={`rounded-xl border overflow-hidden transition-all duration-500 ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B] shadow-lg'}`}>
            <div className={`px-5 py-4 flex items-center justify-between border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor || (isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]')}`}>
                        <FontAwesomeIcon icon={icon} className="text-xs text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-semibold truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>{title}</h3>
                            {badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${badge.color}`}>{badge.text}</span>}
                        </div>
                        <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{subtitle}</p>
                    </div>
                </div>
                <div className="relative flex-shrink-0 ml-3">
                    <FontAwesomeIcon icon={faSearch} className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] ${isLight ? 'text-slate-300' : 'text-gray-600'}`} />
                    <input
                        type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
                        className={`pl-7 pr-3 py-1.5 text-xs rounded-lg border outline-none w-32 transition-all ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-300 focus:border-blue-300' : 'bg-[#1C1C1C] border-[#333] text-gray-300 placeholder:text-gray-600 focus:border-[#444]'}`}
                    />
                </div>
            </div>
            <div>
                <table className="w-full table-fixed">
                    <thead>
                        <tr className={isLight ? 'bg-slate-50/80' : 'bg-[#1A1A1A]'}>
                            {columns.map(col => (
                                <th key={col.key} className={thClass} onClick={() => toggleSort(col.key)}>
                                    <span className="flex items-center gap-1.5">
                                        {col.label}
                                        <FontAwesomeIcon icon={sortKey === col.key ? (sortDir === 'asc' ? faSortUp : faSortDown) : faSort} className="text-[9px] opacity-50" />
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.length > 0 ? pageData.map((row, i) => (
                            <tr
                                key={row._id || i}
                                className={`border-t transition-colors ${isLight ? 'border-slate-100' : 'border-[#222]'} ${onRowClick ? 'cursor-pointer' : ''} ${
                                    striped && i % 2 === 1
                                        ? (isLight ? 'bg-blue-50/20' : 'bg-[#1A1A1A]')
                                        : ''
                                } ${isLight ? 'hover:bg-blue-50/40' : 'hover:bg-[#0e0e0e]'}`}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((col, ci) => (
                                    <td key={col.key} className={`${tdClass} ${ci === 0 ? 'truncate' : 'whitespace-nowrap'}`}>
                                        {col.render ? col.render(row) : (col.value ? col.value(row) : row[col.key])}
                                    </td>
                                ))}
                            </tr>
                        )) : (
                            <tr><td colSpan={columns.length} className={`px-4 py-10 text-center ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                <FontAwesomeIcon icon={emptyIcon || icon} className="text-xl mb-2 opacity-30 block mx-auto" />
                                <p className="text-sm">{emptyText || 'No data'}</p>
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {sorted.length > perPage && (
                <div className={`px-5 py-3 flex items-center justify-between border-t ${isLight ? 'border-slate-100 bg-slate-50/50' : 'border-[#222] bg-[#141414]'}`}>
                    <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                        {page * perPage + 1}–{Math.min((page + 1) * perPage, sorted.length)} of {sorted.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${page === 0 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = totalPages <= 5 ? i : Math.min(Math.max(page - 2, 0), totalPages - 5) + i
                            return (
                                <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-7 h-7 rounded-md text-[11px] font-medium transition-all ${page === pageNum ? (isLight ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-600 text-white') : (isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-gray-400 hover:bg-[#333]')}`}>
                                    {pageNum + 1}
                                </button>
                            )
                        })}
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${page === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : (isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#333] text-gray-400')}`}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const Overview = ({ user, theme }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const videos = useSelector((state) => state.videos.data)
    const tags = useSelector((state) => state.tags.data)
    const category = useSelector((state) => state.category.data)
    const allUsers = useSelector((state) => state.manageUsers.data)
    const gamesData = useSelector((state) => state.gameManager.data)
    const projectsData = useSelector((state) => state.project.user_project)

    const budgetState = useSelector((state) => state.budget)
    const notificationState = useSelector((state) => state.notification)
    const portfolioState = useSelector((state) => state.portfolio)

    const [isVisible, setIsVisible] = useState(false)
    const [insightsExpanded, setInsightsExpanded] = useState(false)

    const isLight = theme === 'light'
    const role = user?.role || 'User'
    const isAdmin = role === 'Admin'
    const isMod = role === 'Moderator'
    const isStaff = isAdmin || isMod

    useEffect(() => {
        if (user) {
            dispatch(getUserVideos({ id: user._id, type: 'video' }))
            dispatch(getTags({ type: 'video' }))
            dispatch(getCategory({ type: 'video' }))
            if (isStaff) dispatch(getAllUsers())

            dispatch(fetchGames())
            dispatch(getProjects({ id: user._id }))

            const now = new Date()
            dispatch(getBudgetDashboard({ month: now.getMonth() + 1, year: now.getFullYear() }))
            dispatch(getBudgetCategories())
            dispatch(getBudgetExpenses({ month: now.getMonth() + 1, year: now.getFullYear() }))
            dispatch(getDebts())
            dispatch(getBudgetSavings())
            dispatch(getFinancialGoals())
            dispatch(getNotifications({ page: 1, limit: 20 }))
            dispatch(getUnreadCount())
            dispatch(getPortfolio({ id: user._id }))
        }
    }, [user])

    useEffect(() => { setIsVisible(true) }, [])

    const videosArray = useMemo(() => Array.isArray(videos) ? videos : [], [videos])
    const tagsArray = useMemo(() => Array.isArray(tags) ? tags : [], [tags])
    const categoryArray = useMemo(() => Array.isArray(category) ? category : [], [category])
    const usersArray = useMemo(() => Array.isArray(allUsers) ? allUsers : [], [allUsers])
    const gamesArray = useMemo(() => Array.isArray(gamesData) ? gamesData : [], [gamesData])
    const projectsArray = useMemo(() => Array.isArray(projectsData) ? projectsData : [], [projectsData])

    const dashboard = budgetState?.dashboard || {}
    const expenses = useMemo(() => Array.isArray(budgetState?.expenses) ? budgetState.expenses : [], [budgetState?.expenses])
    const debts = useMemo(() => Array.isArray(budgetState?.debts) ? budgetState.debts : [], [budgetState?.debts])
    const savings = budgetState?.savings || {}
    const goals = useMemo(() => Array.isArray(budgetState?.goals) ? budgetState.goals : [], [budgetState?.goals])
    const budgetCategories = useMemo(() => Array.isArray(budgetState?.categories) ? budgetState.categories : [], [budgetState?.categories])

    const notifications = useMemo(() => Array.isArray(notificationState?.notifications) ? notificationState.notifications : [], [notificationState?.notifications])
    const unreadCount = notificationState?.unreadCount || 0
    const portfolio = portfolioState?.data || null

    const totalViews = useMemo(() => videosArray.reduce((sum, v) => sum + (v.views?.length || 0), 0), [videosArray])
    const totalLikes = useMemo(() => videosArray.reduce((sum, v) => sum + (v.likes?.length || 0), 0), [videosArray])
    const totalUsersCount = usersArray.length
    const adminCount = useMemo(() => usersArray.filter(u => u.role === 'Admin').length, [usersArray])
    const modCount = useMemo(() => usersArray.filter(u => u.role === 'Moderator').length, [usersArray])
    const regularCount = useMemo(() => usersArray.filter(u => u.role === 'User').length, [usersArray])
    const bannedCount = useMemo(() => usersArray.filter(u => u.ban).length, [usersArray])
    const verifiedCount = useMemo(() => usersArray.filter(u => u.verification?.verified).length, [usersArray])
    const unverifiedCount = totalUsersCount - verifiedCount

    const totalExpense = dashboard?.totalExpense || 0
    const totalIncome = dashboard?.totalIncome || 0
    const balance = totalIncome - totalExpense
    const spendRatio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0
    const activeDebts = useMemo(() => debts.filter(d => d.status !== 'paid'), [debts])
    const totalDebtOwed = useMemo(() => activeDebts.reduce((sum, d) => sum + ((d.amount || 0) - (d.paid || 0)), 0), [activeDebts])
    const savingsAmount = savings?.currentAmount || savings?.amount || 0
    const savingsGoal = savings?.goalAmount || savings?.goal || 0
    const savingsPct = savingsGoal > 0 ? Math.round((savingsAmount / savingsGoal) * 100) : 0
    const incompleteGoals = useMemo(() => goals.filter(g => !g.completed && g.targetAmount > 0), [goals])
    const completedGoals = useMemo(() => goals.filter(g => g.completed), [goals])

    const publishedGames = useMemo(() => gamesArray.filter(g => g.published || g.status === 'published'), [gamesArray])
    const draftGames = useMemo(() => gamesArray.filter(g => !g.published && g.status !== 'published'), [gamesArray])
    const publishedProjects = useMemo(() => projectsArray.filter(p => p.published || p.status === 'published'), [projectsArray])
    const draftProjects = useMemo(() => projectsArray.filter(p => !p.published && p.status !== 'published'), [projectsArray])
    const portfolioSections = portfolio?.sections?.length || 0

    const timeAgo = (dateString) => {
        if (!dateString) return '—'
        const diffMs = new Date() - new Date(dateString)
        const diffMin = Math.floor(diffMs / 60000)
        if (diffMin < 1) return 'Just now'
        if (diffMin < 60) return `${diffMin}m ago`
        const diffHr = Math.floor(diffMin / 60)
        if (diffHr < 24) return `${diffHr}h ago`
        const diffDay = Math.floor(diffHr / 24)
        if (diffDay < 30) return `${diffDay}d ago`
        return `${Math.floor(diffDay / 30)}mo ago`
    }

    const formatDate = (dateString) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const staffStats = useMemo(() => {
        if (!isStaff) return []
        const stats = [
            { title: 'Total Users', value: totalUsersCount, icon: faUsers, color: 'from-blue-500 to-indigo-500', subtitle: `${verifiedCount} verified, ${unverifiedCount} unverified` },
            { title: 'Verified', value: verifiedCount, icon: faCircleCheck, color: 'from-emerald-500 to-green-500', subtitle: totalUsersCount > 0 ? `${Math.round((verifiedCount / totalUsersCount) * 100)}% of users` : '—' },
            { title: 'Banned', value: bannedCount, icon: faBan, color: 'from-red-500 to-rose-500', subtitle: bannedCount > 0 ? `${bannedCount} currently banned` : 'None' },
        ]
        if (isAdmin) {
            stats.push(
                { title: 'Admins', value: adminCount, icon: faShieldHalved, color: 'from-red-500 to-rose-600', subtitle: 'Full access' },
                { title: 'Moderators', value: modCount, icon: faUserShield, color: 'from-amber-500 to-yellow-500', subtitle: 'Manage & moderate' },
                { title: 'Regular', value: regularCount, icon: faUsers, color: 'from-sky-500 to-cyan-500', subtitle: totalUsersCount > 0 ? `${Math.round((regularCount / totalUsersCount) * 100)}% of users` : '—' },
            )
        }
        return stats
    }, [isStaff, isAdmin, totalUsersCount, verifiedCount, unverifiedCount, bannedCount, adminCount, modCount, regularCount])

    // Insights
    const insights = useMemo(() => {
        const items = []

        // Notifications
        if (unreadCount > 0) items.push({ icon: faBell, color: 'text-blue-500', bg: isLight ? 'bg-blue-50' : 'bg-blue-900/20', title: `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`, desc: 'Check your latest notifications for likes, comments, and subscriptions.', action: 'View', onClick: () => {} })

        // Budget insights
        if (totalExpense > 0 || totalIncome > 0) {
            if (spendRatio > 90) items.push({ icon: faExclamationTriangle, color: 'text-red-500', bg: isLight ? 'bg-red-50' : 'bg-red-900/20', title: 'Critical: Over 90% spent', desc: `You've used ${spendRatio}% of income. You're almost out of budget for this month.`, action: 'Review Budget', onClick: () => navigate('/budget') })
            else if (spendRatio > 80) items.push({ icon: faExclamationTriangle, color: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-900/20', title: 'High spending alert', desc: `${spendRatio}% of income spent. Consider cutting back on non-essentials.`, action: 'Review Budget', onClick: () => navigate('/budget') })
            else if (spendRatio > 50) items.push({ icon: faChartLine, color: 'text-blue-500', bg: isLight ? 'bg-blue-50' : 'bg-blue-900/20', title: 'Moderate spending', desc: `${spendRatio}% spent so far this month. You're doing okay.`, action: 'View Budget', onClick: () => navigate('/budget') })
            else items.push({ icon: faChartLine, color: 'text-emerald-500', bg: isLight ? 'bg-emerald-50' : 'bg-emerald-900/20', title: 'Budget on track', desc: `Only ${spendRatio}% of income spent. Great financial discipline!`, action: 'View Budget', onClick: () => navigate('/budget') })
            if (balance < 0) items.push({ icon: faExclamationTriangle, color: 'text-red-500', bg: isLight ? 'bg-red-50' : 'bg-red-900/20', title: 'Negative balance', desc: `You've overspent by ₱${Math.abs(balance).toLocaleString()} this month.`, action: 'Fix Budget', onClick: () => navigate('/budget') })
        } else {
            items.push({ icon: faWallet, color: 'text-violet-500', bg: isLight ? 'bg-violet-50' : 'bg-violet-900/20', title: 'No budget data yet', desc: 'Start tracking expenses to get financial insights here.', action: 'Go to Budget', onClick: () => navigate('/budget') })
        }

        // Debt insights
        if (activeDebts.length > 0) {
            items.push({ icon: faCreditCard, color: 'text-rose-500', bg: isLight ? 'bg-rose-50' : 'bg-rose-900/20', title: `${activeDebts.length} active debt${activeDebts.length !== 1 ? 's' : ''} — ₱${totalDebtOwed.toLocaleString()}`, desc: 'Track payments and stay on top of what you owe.', action: 'Manage Debts', onClick: () => navigate('/budget') })
            const overdue = activeDebts.filter(d => d.dueDate && new Date(d.dueDate) < new Date())
            if (overdue.length > 0) items.push({ icon: faExclamationTriangle, color: 'text-red-500', bg: isLight ? 'bg-red-50' : 'bg-red-900/20', title: `${overdue.length} overdue debt${overdue.length !== 1 ? 's' : ''}`, desc: 'Some debts are past their due date. Take action now.', action: 'View Debts', onClick: () => navigate('/budget') })
        }

        // Savings insights
        if (savingsGoal > 0 && savingsAmount > 0) {
            if (savingsPct >= 100) items.push({ icon: faTrophy, color: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-900/20', title: 'Savings goal reached!', desc: `You've saved ₱${savingsAmount.toLocaleString()} — goal met! Set a new target.`, action: 'Update Goal', onClick: () => navigate('/budget') })
            else items.push({ icon: faPiggyBank, color: 'text-teal-500', bg: isLight ? 'bg-teal-50' : 'bg-teal-900/20', title: `Savings: ${savingsPct}% complete`, desc: `₱${savingsAmount.toLocaleString()} of ₱${savingsGoal.toLocaleString()}. Keep going!`, action: 'View Savings', onClick: () => navigate('/budget') })
        } else if (!savingsGoal && !savingsAmount) {
            items.push({ icon: faPiggyBank, color: 'text-teal-500', bg: isLight ? 'bg-teal-50' : 'bg-teal-900/20', title: 'Set a savings goal', desc: 'No savings goal yet. Start building your emergency fund.', action: 'Set Goal', onClick: () => navigate('/budget') })
        }

        // Financial goals
        if (incompleteGoals.length > 0) {
            const closest = incompleteGoals.reduce((best, g) => { const pct = (g.currentAmount || 0) / g.targetAmount; return pct > (best.pct || 0) ? { ...g, pct } : best }, { pct: 0 })
            if (closest.name) items.push({ icon: faBullseye, color: 'text-blue-500', bg: isLight ? 'bg-blue-50' : 'bg-blue-900/20', title: `"${closest.name}" — ${Math.round(closest.pct * 100)}%`, desc: `${incompleteGoals.length} goal${incompleteGoals.length !== 1 ? 's' : ''} in progress. ${completedGoals.length > 0 ? `${completedGoals.length} completed.` : ''}`, action: 'View Goals', onClick: () => navigate('/budget') })
        }
        if (budgetCategories.length === 0) items.push({ icon: faFolder, color: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-900/20', title: 'Create budget categories', desc: 'Organize your spending with categories for better tracking.', action: 'Create', onClick: () => navigate('/budget') })

        // Video insights
        if (videosArray.length === 0) {
            items.push({ icon: faVideo, color: 'text-sky-500', bg: isLight ? 'bg-sky-50' : 'bg-sky-900/20', title: 'Upload your first video', desc: 'Share content with the community and start building your channel.', action: 'Upload', onClick: () => navigate('/account/videos') })
        } else {
            if (totalViews > 100) items.push({ icon: faFire, color: 'text-orange-500', bg: isLight ? 'bg-orange-50' : 'bg-orange-900/20', title: `${totalViews.toLocaleString()} total views`, desc: `Your ${videosArray.length} video${videosArray.length !== 1 ? 's' : ''} have accumulated ${totalViews.toLocaleString()} views. Keep creating!`, action: 'View Videos', onClick: () => navigate('/account/videos') })
            if (totalLikes > 0) items.push({ icon: faHeart, color: 'text-rose-500', bg: isLight ? 'bg-rose-50' : 'bg-rose-900/20', title: `${totalLikes.toLocaleString()} total likes`, desc: `Your content has received ${totalLikes.toLocaleString()} likes across all videos.`, action: 'My Videos', onClick: () => navigate('/account/videos') })

            const noViewVideos = videosArray.filter(v => (v.views?.length || 0) === 0)
            if (noViewVideos.length > 0 && videosArray.length > 1) items.push({ icon: faEye, color: 'text-slate-400', bg: isLight ? 'bg-slate-50' : 'bg-slate-900/20', title: `${noViewVideos.length} video${noViewVideos.length !== 1 ? 's' : ''} with 0 views`, desc: 'Some videos haven\'t gotten traction yet. Try updating thumbnails or titles.', action: 'Manage Videos', onClick: () => navigate('/account/videos') })
        }

        // Game insights
        if (gamesArray.length === 0) {
            items.push({ icon: faGamepad, color: 'text-violet-500', bg: isLight ? 'bg-violet-50' : 'bg-violet-900/20', title: 'Create your first game', desc: 'Use the game editor to build and publish browser games.', action: 'Get Started', onClick: () => navigate('/games') })
        } else {
            if (draftGames.length > 0) items.push({ icon: faGamepad, color: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-900/20', title: `${draftGames.length} draft game${draftGames.length !== 1 ? 's' : ''}`, desc: `You have unpublished games. Finish and share them with the community.`, action: 'Edit Games', onClick: () => navigate('/games') })
            if (publishedGames.length > 0) items.push({ icon: faRocket, color: 'text-emerald-500', bg: isLight ? 'bg-emerald-50' : 'bg-emerald-900/20', title: `${publishedGames.length} live game${publishedGames.length !== 1 ? 's' : ''}`, desc: `${publishedGames.length} game${publishedGames.length !== 1 ? 's are' : ' is'} published and playable.`, action: 'View Games', onClick: () => navigate('/games') })
        }

        // Project insights
        if (projectsArray.length === 0) {
            items.push({ icon: faProjectDiagram, color: 'text-cyan-500', bg: isLight ? 'bg-cyan-50' : 'bg-cyan-900/20', title: 'Start a project', desc: 'Showcase your development work by creating a project page.', action: 'Create Project', onClick: () => navigate('/projects') })
        } else {
            if (draftProjects.length > 0) items.push({ icon: faProjectDiagram, color: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-900/20', title: `${draftProjects.length} draft project${draftProjects.length !== 1 ? 's' : ''}`, desc: 'Finish and publish your projects to share with others.', action: 'Edit Projects', onClick: () => navigate('/projects') })
            if (publishedProjects.length > 0) items.push({ icon: faCode, color: 'text-emerald-500', bg: isLight ? 'bg-emerald-50' : 'bg-emerald-900/20', title: `${publishedProjects.length} published project${publishedProjects.length !== 1 ? 's' : ''}`, desc: 'Your projects are live and visible to the community.', action: 'View Projects', onClick: () => navigate('/projects') })

            const noImageProjects = projectsArray.filter(p => !p.image && !p.thumbnail)
            if (noImageProjects.length > 0) items.push({ icon: faImage, color: 'text-slate-400', bg: isLight ? 'bg-slate-50' : 'bg-slate-900/20', title: `${noImageProjects.length} project${noImageProjects.length !== 1 ? 's' : ''} without images`, desc: 'Adding thumbnails or screenshots makes your projects more appealing.', action: 'Add Images', onClick: () => navigate('/projects') })
        }

        // Portfolio insights
        if (!portfolio || (!portfolio.published && !portfolio.sections?.length)) items.push({ icon: faBriefcase, color: 'text-indigo-500', bg: isLight ? 'bg-indigo-50' : 'bg-indigo-900/20', title: 'Build your portfolio', desc: 'Create a portfolio to showcase your work and skills professionally.', action: 'Start Building', onClick: () => navigate('/portfolio') })
        else if (portfolio && !portfolio.published) items.push({ icon: faBriefcase, color: 'text-indigo-500', bg: isLight ? 'bg-indigo-50' : 'bg-indigo-900/20', title: 'Publish your portfolio', desc: `Your portfolio has ${portfolioSections} section${portfolioSections !== 1 ? 's' : ''} but isn't live yet. Publish to share it.`, action: 'Publish Now', onClick: () => navigate('/portfolio') })
        else if (portfolio?.published) {
            if (portfolioSections < 3) items.push({ icon: faGlobe, color: 'text-blue-500', bg: isLight ? 'bg-blue-50' : 'bg-blue-900/20', title: 'Expand your portfolio', desc: `Only ${portfolioSections} section${portfolioSections !== 1 ? 's' : ''}. Add more to make it comprehensive.`, action: 'Edit Portfolio', onClick: () => navigate('/portfolio') })
            if (!portfolio.bio && !portfolio.about) items.push({ icon: faBriefcase, color: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-900/20', title: 'Add a bio to your portfolio', desc: 'A personal bio helps visitors understand who you are.', action: 'Edit Bio', onClick: () => navigate('/portfolio') })
            if (!portfolio.links || Object.values(portfolio.links || {}).filter(Boolean).length === 0) items.push({ icon: faLink, color: 'text-cyan-500', bg: isLight ? 'bg-cyan-50' : 'bg-cyan-900/20', title: 'Add social links', desc: 'Connect your GitHub, LinkedIn, or website to your portfolio.', action: 'Add Links', onClick: () => navigate('/portfolio') })
        }

        // Account insights
        if (!user?.verification?.verified) items.push({ icon: faCircleCheck, color: 'text-blue-500', bg: isLight ? 'bg-blue-50' : 'bg-blue-900/20', title: 'Verify your account', desc: 'Get verified to unlock all features and build trust.', action: 'Verify', onClick: () => navigate('/account/settings') })
        if (user?.subscribers?.length === 0) items.push({ icon: faUserPlus, color: 'text-violet-500', bg: isLight ? 'bg-violet-50' : 'bg-violet-900/20', title: 'Grow your audience', desc: 'No subscribers yet. Upload content and engage to attract followers.', action: 'My Videos', onClick: () => navigate('/account/videos') })

        // Content summary
        const totalContent = videosArray.length + gamesArray.length + projectsArray.length
        if (totalContent > 10) items.push({ icon: faStar, color: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-900/20', title: `${totalContent} total content items`, desc: `${videosArray.length} videos, ${gamesArray.length} games, ${projectsArray.length} projects — great work!`, action: 'Dashboard', onClick: () => {} })

        return items
    }, [unreadCount, totalExpense, totalIncome, spendRatio, balance, activeDebts, totalDebtOwed, savingsAmount, savingsGoal, savingsPct, incompleteGoals, completedGoals, portfolio, portfolioSections, videosArray, totalViews, totalLikes, gamesArray, publishedGames, draftGames, projectsArray, publishedProjects, draftProjects, budgetCategories, user, isLight])

    // Table data
    const videoRows = useMemo(() => videosArray.slice(0, 20).map(v => ({
        _id: v._id, title: v.title || v.name || 'Untitled', views: v.views?.length || 0, likes: v.likes?.length || 0, type: v.type || 'video', createdAt: v.createdAt,
    })), [videosArray])

    const expenseRows = useMemo(() => expenses.slice(0, 20).map(e => ({
        _id: e._id, description: e.description || '—', amount: e.amount || 0, category: e.category?.name || 'Uncategorized', date: e.date,
    })), [expenses])

    const gameRows = useMemo(() => gamesArray.slice(0, 20).map(g => ({
        _id: g._id, title: g.title || g.name || 'Untitled', status: g.published || g.status === 'published' ? 'Published' : 'Draft', category: g.category || g.genre || '—', createdAt: g.createdAt,
    })), [gamesArray])

    const projectRows = useMemo(() => projectsArray.slice(0, 20).map(p => ({
        _id: p._id, title: p.title || p.name || 'Untitled', status: p.published || p.status === 'published' ? 'Published' : 'Draft', tags: (p.tags || []).slice(0, 2).join(', ') || '—', createdAt: p.createdAt,
    })), [projectsArray])

    const recentNotifs = useMemo(() => notifications.slice(0, 10), [notifications])

    const headerMessages = {
        Admin: "Full platform overview — manage users, monitor activity, and review system health.",
        Moderator: "Keep the community safe — monitor users and review flagged content.",
        User: "Here's your dashboard with insights, data, and recent activity."
    }

    const roleBadgeStyle = {
        Admin: isLight ? 'bg-red-100 text-red-700 border-red-200' : 'bg-red-900/30 text-red-400 border-red-800',
        Moderator: isLight ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-amber-900/30 text-amber-400 border-amber-800',
        User: isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-900/30 text-blue-400 border-blue-800',
    }

    const cardClass = `rounded-xl overflow-hidden ${isLight ? 'bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg' : 'bg-[#1C1C1C] shadow-lg hover:shadow-xl'} transition-all duration-500 ease-out`

    const renderStatCard = (stat, index, delay = 0) => (
        <div key={index} className={`relative ${cardClass} hover:scale-105 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay + index * 80}ms` }}>
            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} shadow-md flex-shrink-0`}>
                        <FontAwesomeIcon icon={stat.icon} className="text-white text-base" />
                    </div>
                </div>
                <p className={`text-xs font-medium mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{stat.title}</p>
                <p className={`text-2xl font-bold mb-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    {stat.prefix || ''}<CountUp end={stat.value} duration={2} separator="," />
                </p>
                <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{stat.subtitle}</p>
            </div>
        </div>
    )

    const statusBadge = (status) => {
        const isPub = status === 'Published'
        return (
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isPub
                    ? (isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-900/30 text-emerald-400')
                    : (isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/30 text-amber-400')
            }`}>
                <FontAwesomeIcon icon={faCircle} className="text-[4px]" />
                {status}
            </span>
        )
    }

    const viewsBar = (views, maxViews) => {
        const pct = maxViews > 0 ? Math.min((views / maxViews) * 100, 100) : 0
        return (
            <span className="inline-flex items-center gap-2">
                <span className={`font-semibold text-sm ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{views.toLocaleString()}</span>
                <span className={`inline-block w-[50px] h-1.5 rounded-full ${isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]'}`}>
                    <span className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400" style={{ width: `${pct}%` }} />
                </span>
            </span>
        )
    }

    const maxViews = useMemo(() => Math.max(...videoRows.map(v => v.views), 1), [videoRows])
    const maxExpense = useMemo(() => Math.max(...expenseRows.map(e => e.amount), 1), [expenseRows])

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            {/* Header */}
            <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                <div className="flex items-center gap-3 mb-3">
                    <h1 className={`text-3xl font-semibold ${isLight ? light.heading : dark.heading}`}>Dashboard</h1>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${roleBadgeStyle[role] || roleBadgeStyle.User}`}>{role}</span>
                </div>
                <p className={`text-sm leading-relaxed ${isLight ? light.text : dark.text}`}>
                    Welcome back, <span className="font-medium">{user?.username || 'User'}</span>! {headerMessages[role] || headerMessages.User}
                </p>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '50ms' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faLightbulb} className={`text-sm ${isLight ? 'text-amber-500' : 'text-amber-400'}`} />
                            <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Insights & Recommendations</h2>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${isLight ? 'bg-amber-100 text-amber-600' : 'bg-amber-900/30 text-amber-400'}`}>{insights.length} items</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {(insightsExpanded ? insights : insights.slice(0, 6)).map((item, i) => (
                            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${isLight ? 'bg-white/60 border-slate-200/60 hover:border-blue-200 hover:shadow-sm' : 'bg-[#141414] border-[#222] hover:border-[#333]'}`}>
                                <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center ${item.bg}`}>
                                    <FontAwesomeIcon icon={item.icon} className={`text-sm ${item.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold mb-0.5 leading-snug ${isLight ? 'text-slate-800' : 'text-white'}`}>{item.title}</p>
                                    <p className={`text-xs leading-relaxed mb-2 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{item.desc}</p>
                                    {item.action && item.onClick && (
                                        <button onClick={item.onClick} className={`text-xs font-medium flex items-center gap-1 transition-all ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'}`}>
                                            {item.action} <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {insights.length > 6 && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => setInsightsExpanded(prev => !prev)}
                                className={`text-xs font-medium flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-all ${
                                    isLight
                                        ? 'border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50'
                                        : 'border-[#333] text-gray-400 hover:text-blue-400 hover:border-blue-800 hover:bg-blue-900/10'
                                }`}
                            >
                                {insightsExpanded ? 'View Less' : `View More (${insights.length - 6})`}
                                <FontAwesomeIcon icon={insightsExpanded ? faChevronLeft : faChevronRight} className="text-[9px] rotate-90" style={{ transform: insightsExpanded ? 'rotate(-90deg)' : 'rotate(90deg)' }} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Staff Stats */}
            {isStaff && staffStats.length > 0 && (
                <div>
                    <div className={`flex items-center gap-2 mb-4 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{ transitionDelay: '150ms' }}>
                        <FontAwesomeIcon icon={isAdmin ? faShieldHalved : faGavel} className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`} />
                        <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>{isAdmin ? 'User Management' : 'Moderation'}</h2>
                    </div>
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
                        {staffStats.map((stat, i) => renderStatCard(stat, i, 150))}
                    </div>
                </div>
            )}

            {/* Data Tables Row 1: Videos + Expenses */}
            <div className={`space-y-6 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: isStaff ? '500ms' : '200ms' }}>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MiniTable
                        theme={theme} icon={faVideo} iconColor="bg-gradient-to-br from-blue-500 to-sky-500"
                        title="Recent Videos" subtitle={`${videosArray.length} total videos`}
                        badge={videosArray.length > 0 ? { text: `${totalViews} views`, color: isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400' } : null}
                        striped
                        columns={[
                            { key: 'title', label: 'Title', render: (row) => (
                                <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`} title={row.title}>{row.title}</span>
                            )},
                            { key: 'views', label: 'Views', render: (row) => viewsBar(row.views, maxViews) },
                            { key: 'likes', label: 'Likes', render: (row) => (
                                <span className="inline-flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faHeart} className={`text-[10px] ${row.likes > 0 ? 'text-rose-500' : (isLight ? 'text-slate-300' : 'text-gray-600')}`} />
                                    <span className={row.likes > 0 ? (isLight ? 'text-rose-600 font-semibold' : 'text-rose-400 font-semibold') : ''}>{row.likes}</span>
                                </span>
                            )},
                            { key: 'createdAt', label: 'Date', value: (row) => row.createdAt, render: (row) => <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatDate(row.createdAt)}</span> },
                        ]}
                        data={videoRows} emptyIcon={faVideo} emptyText="No videos uploaded yet"
                        onRowClick={(row) => navigate(`/watch/${row._id}`)}
                    />

                    <MiniTable
                        theme={theme} icon={faReceipt} iconColor="bg-gradient-to-br from-rose-500 to-pink-500"
                        title="Recent Expenses" subtitle="This month's transactions"
                        badge={totalExpense > 0 ? { text: `₱${totalExpense.toLocaleString()}`, color: isLight ? 'bg-rose-100 text-rose-600' : 'bg-rose-900/30 text-rose-400' } : null}
                        striped
                        columns={[
                            { key: 'description', label: 'Description', render: (row) => (
                                <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`} title={row.description}>{row.description}</span>
                            )},
                            { key: 'amount', label: 'Amount', render: (row) => {
                                const ratio = maxExpense > 0 ? row.amount / maxExpense : 0
                                const color = ratio > 0.7 ? 'text-red-500 font-bold' : ratio > 0.4 ? (isLight ? 'text-amber-600 font-semibold' : 'text-amber-400 font-semibold') : (isLight ? 'text-slate-700 font-semibold' : 'text-gray-200 font-semibold')
                                return (
                                    <span className={`inline-flex items-center gap-1.5 text-sm ${color}`}>
                                        ₱{row.amount.toLocaleString()}
                                        {ratio > 0.7 && <FontAwesomeIcon icon={faArrowUp} className="text-[9px] text-red-400" />}
                                    </span>
                                )
                            }},
                            { key: 'category', label: 'Category', render: (row) => (
                                <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${getCategoryColor(row.category, isLight)}`}>{row.category}</span>
                            )},
                            { key: 'date', label: 'Date', value: (row) => row.date, render: (row) => <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatDate(row.date)}</span> },
                        ]}
                        data={expenseRows} emptyIcon={faReceipt} emptyText="No expenses this month"
                        onRowClick={() => navigate('/budget')}
                    />
                </div>

                {/* Data Tables Row 2: Games + Projects */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <MiniTable
                        theme={theme} icon={faGamepad} iconColor="bg-gradient-to-br from-violet-500 to-purple-500"
                        title="Games" subtitle={`${gamesArray.length} total games`}
                        badge={publishedGames.length > 0 ? { text: `${publishedGames.length} live`, color: isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-900/30 text-emerald-400' } : null}
                        striped
                        columns={[
                            { key: 'title', label: 'Title', render: (row) => (
                                <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`} title={row.title}>{row.title}</span>
                            )},
                            { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
                            { key: 'category', label: 'Genre', render: (row) => (
                                <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${row.category !== '—' ? getCategoryColor(row.category, isLight) : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-[#2B2B2B] text-gray-500')}`}>{row.category}</span>
                            )},
                            { key: 'createdAt', label: 'Date', value: (row) => row.createdAt, render: (row) => <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatDate(row.createdAt)}</span> },
                        ]}
                        data={gameRows} emptyIcon={faGamepad} emptyText="No games created yet"
                        onRowClick={(row) => navigate(`/games/${row._id}`)}
                    />

                    <MiniTable
                        theme={theme} icon={faProjectDiagram} iconColor="bg-gradient-to-br from-emerald-500 to-teal-500"
                        title="Projects" subtitle={`${projectsArray.length} total projects`}
                        badge={publishedProjects.length > 0 ? { text: `${publishedProjects.length} live`, color: isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-900/30 text-emerald-400' } : null}
                        striped
                        columns={[
                            { key: 'title', label: 'Title', render: (row) => (
                                <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-white'}`} title={row.title}>{row.title}</span>
                            )},
                            { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
                            { key: 'tags', label: 'Tags', render: (row) => (
                                <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`} title={row.tags}>{row.tags}</span>
                            )},
                            { key: 'createdAt', label: 'Date', value: (row) => row.createdAt, render: (row) => <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{formatDate(row.createdAt)}</span> },
                        ]}
                        data={projectRows} emptyIcon={faProjectDiagram} emptyText="No projects created yet"
                        onRowClick={(row) => navigate(`/projects/${row._id}`)}
                    />
                </div>
            </div>

            {/* Recent Activity Log */}
            <div className={`rounded-xl border overflow-hidden transition-all duration-700 ease-out ${isLight ? 'bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm' : 'bg-[#161616] border-[#2B2B2B] shadow-lg'} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: isStaff ? '700ms' : '400ms' }}>
                <div className={`px-5 py-4 flex items-center justify-between border-b ${isLight ? 'border-slate-100' : 'border-[#222]'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500">
                            <FontAwesomeIcon icon={faBell} className="text-xs text-white" />
                        </div>
                        <div>
                            <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Recent Activity</h3>
                            <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>Latest notifications & events</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${isLight ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400'}`}>
                            {unreadCount} new
                        </span>
                    )}
                </div>
                <div>
                    {recentNotifs.length > 0 ? recentNotifs.map((n, i) => (
                        <div
                            key={n._id || i}
                            className={`flex items-start gap-3 px-5 py-3.5 border-t transition-colors ${
                                i === 0 ? 'border-transparent' : (isLight ? 'border-slate-50' : 'border-[#1C1C1C]')
                            } ${!n.read ? (isLight ? 'bg-blue-50/40' : 'bg-blue-900/10') : ''
                            } ${isLight ? 'hover:bg-slate-50' : 'hover:bg-[#1C1C1C]'} ${n.link ? 'cursor-pointer' : ''}`}
                            onClick={() => n.link && navigate(n.link)}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                !n.read ? (isLight ? 'bg-blue-100' : 'bg-blue-900/30') : (isLight ? 'bg-slate-100' : 'bg-[#2B2B2B]')
                            }`}>
                                <FontAwesomeIcon icon={TYPE_ICONS[n.type] || faBell} className={`text-xs ${TYPE_COLORS[n.type] || 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-snug ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>
                                    <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{n.sender?.username || 'System'}</span>
                                    {' '}{n.message}
                                </p>
                                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{timeAgo(n.createdAt)}</p>
                            </div>
                            {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2.5 animate-pulse" />}
                        </div>
                    )) : (
                        <div className={`text-center py-12 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            <FontAwesomeIcon icon={faBell} className="text-2xl mb-2 opacity-30" />
                            <p className="text-sm">No recent activity</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Overview
