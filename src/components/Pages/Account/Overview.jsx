import React, { useEffect, useState, useMemo } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getUserVideos } from '../../../actions/videos';
import { getTags } from '../../../actions/tags';
import { getCategory } from '../../../actions/category';
import { getAuthor } from '../../../actions/author';
import { getAllUsers } from '../../../actions/manageUsers';

import Table from '../../Custom/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faTag, faFolder, faEye, faUserPen, faUsers, faUserShield, faGavel, faBan, faCircleCheck, faShieldHalved, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import CountUp from 'react-countup';

const Overview = ({ user, theme }) => {
    const dispatch = useDispatch()

    const videos = useSelector((state) => state.videos.data)
    const tags = useSelector((state) => state.tags.data)
    const category = useSelector((state) => state.category.data)
    const author = useSelector((state) => state.author.data)
    const loading = useSelector((state) => state.videos.isLoading)
    const allUsers = useSelector((state) => state.manageUsers.data)

    const [tableData, setTableData] = useState([])
    const [selectedData, setSelectedData] = useState(null)
    const [isVisible, setIsVisible] = useState(false)

    const isLight = theme === 'light'
    const role = user?.role || 'User'
    const isAdmin = role === 'Admin'
    const isMod = role === 'Moderator'
    const isStaff = isAdmin || isMod

    useEffect(() => {
        if(user) {
            dispatch(getUserVideos({ id: user._id, type: 'video' }))
            dispatch(getTags({ type: 'video' }))
            dispatch(getCategory({ type: 'video' }))
            dispatch(getAuthor({ type: 'video' }))
            if(isStaff) dispatch(getAllUsers())
        }
    }, [user])

    useEffect(() => { setIsVisible(true) }, [])

    const videosArray = useMemo(() => Array.isArray(videos) ? videos : [], [videos])
    const tagsArray = useMemo(() => Array.isArray(tags) ? tags : [], [tags])
    const categoryArray = useMemo(() => Array.isArray(category) ? category : [], [category])
    const authorArray = useMemo(() => Array.isArray(author) ? author : [], [author])
    const usersArray = useMemo(() => Array.isArray(allUsers) ? allUsers : [], [allUsers])

    useEffect(() => {
        const recentItems = []

        videosArray.slice(0, 5).forEach(video => {
            recentItems.push({
                _id: video._id, type: 'Video',
                name: video.title || video.name,
                count: video.views?.length || 0,
                createdAt: video.createdAt, link: `/account/videos`
            })
        })
        tagsArray.slice(0, 3).forEach(tag => {
            recentItems.push({
                _id: tag._id, type: 'Tag', name: tag.name,
                count: tag.count || 0,
                createdAt: tag.createdAt, link: `/account/globallist`
            })
        })
        categoryArray.slice(0, 3).forEach(cat => {
            recentItems.push({
                _id: cat._id, type: 'Category', name: cat.name,
                count: cat.count || 0,
                createdAt: cat.createdAt, link: `/account/globallist/categories`
            })
        })
        authorArray.slice(0, 3).forEach(auth => {
            recentItems.push({
                _id: auth._id, type: 'Author', name: auth.name,
                count: auth.count || 0,
                createdAt: auth.createdAt, link: `/account/globallist/author`
            })
        })

        recentItems.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        setTableData(recentItems.slice(0, 10))
    }, [videosArray, tagsArray, categoryArray, authorArray])

    const formatDate = (dateString) => {
        if(!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const timeAgo = (dateString) => {
        if(!dateString) return 'N/A'
        const diffMs = new Date() - new Date(dateString)
        const diffMin = Math.floor(diffMs / 60000)
        if(diffMin < 1) return 'Just now'
        if(diffMin < 60) return `${diffMin}m ago`
        const diffHr = Math.floor(diffMin / 60)
        if(diffHr < 24) return `${diffHr}h ago`
        const diffDay = Math.floor(diffHr / 24)
        if(diffDay < 30) return `${diffDay}d ago`
        return `${Math.floor(diffDay / 30)}mo ago`
    }

    const totalViews = useMemo(() =>
        videosArray.reduce((sum, v) => sum + (v.views?.length || 0), 0)
    , [videosArray])

    const getMostRecentDate = (arr) => {
        const dates = arr.filter(i => i.createdAt).map(i => new Date(i.createdAt))
        return dates.length > 0 ? new Date(Math.max(...dates)) : null
    }

    const userStats = [
        {
            title: 'My Videos', value: videosArray.length, icon: faVideo,
            color: 'from-blue-500 to-sky-500',
            subtitle: videosArray.length > 0 ? `Last added ${timeAgo(getMostRecentDate(videosArray))}` : 'No videos yet'
        },
        {
            title: 'My Tags', value: tagsArray.length, icon: faTag,
            color: 'from-emerald-500 to-teal-500',
            subtitle: tagsArray.length > 0 ? `Last added ${timeAgo(getMostRecentDate(tagsArray))}` : 'No tags yet'
        },
        {
            title: 'My Categories', value: categoryArray.length, icon: faFolder,
            color: 'from-amber-500 to-orange-500',
            subtitle: categoryArray.length > 0 ? `Last added ${timeAgo(getMostRecentDate(categoryArray))}` : 'No categories yet'
        },
        {
            title: 'Total Views', value: totalViews, icon: faEye,
            color: 'from-purple-500 to-pink-500',
            subtitle: videosArray.length > 0 ? `Across ${videosArray.length} video${videosArray.length !== 1 ? 's' : ''}` : 'No views yet'
        }
    ]

    const totalUsersCount = usersArray.length
    const adminCount = useMemo(() => usersArray.filter(u => u.role === 'Admin').length, [usersArray])
    const modCount = useMemo(() => usersArray.filter(u => u.role === 'Moderator').length, [usersArray])
    const regularCount = useMemo(() => usersArray.filter(u => u.role === 'User').length, [usersArray])
    const bannedCount = useMemo(() => usersArray.filter(u => u.ban).length, [usersArray])
    const verifiedCount = useMemo(() => usersArray.filter(u => u.verification?.verified).length, [usersArray])
    const unverifiedCount = totalUsersCount - verifiedCount

    const modStats = [
        {
            title: 'Total Users', value: totalUsersCount, icon: faUsers,
            color: 'from-blue-500 to-indigo-500',
            subtitle: `${verifiedCount} verified, ${unverifiedCount} unverified`
        },
        {
            title: 'Banned Users', value: bannedCount, icon: faBan,
            color: 'from-red-500 to-rose-500',
            subtitle: bannedCount > 0 ? `${bannedCount} currently banned` : 'No banned users'
        },
        {
            title: 'Verified Users', value: verifiedCount, icon: faCircleCheck,
            color: 'from-emerald-500 to-green-500',
            subtitle: totalUsersCount > 0 ? `${Math.round((verifiedCount / totalUsersCount) * 100)}% of all users` : '—'
        },
    ]

    const adminStats = [
        {
            title: 'Total Users', value: totalUsersCount, icon: faUsers,
            color: 'from-blue-500 to-indigo-500',
            subtitle: `${verifiedCount} verified, ${unverifiedCount} unverified`
        },
        {
            title: 'Admins', value: adminCount, icon: faShieldHalved,
            color: 'from-red-500 to-rose-500',
            subtitle: 'Full access'
        },
        {
            title: 'Moderators', value: modCount, icon: faUserShield,
            color: 'from-amber-500 to-yellow-500',
            subtitle: 'Can manage & ban users'
        },
        {
            title: 'Regular Users', value: regularCount, icon: faUsers,
            color: 'from-sky-500 to-cyan-500',
            subtitle: totalUsersCount > 0 ? `${Math.round((regularCount / totalUsersCount) * 100)}% of all users` : '—'
        },
        {
            title: 'Banned Users', value: bannedCount, icon: faBan,
            color: 'from-rose-600 to-red-600',
            subtitle: bannedCount > 0 ? `${bannedCount} currently banned` : 'No banned users'
        },
        {
            title: 'Verified Users', value: verifiedCount, icon: faCircleCheck,
            color: 'from-emerald-500 to-green-500',
            subtitle: totalUsersCount > 0 ? `${Math.round((verifiedCount / totalUsersCount) * 100)}% verified` : '—'
        },
    ]

    const platformStats = isAdmin ? adminStats : isMod ? modStats : []

    const headerMessages = {
        Admin: "Full platform overview — manage users, monitor activity, and review system health.",
        Moderator: "Keep the community safe — monitor users and review flagged content.",
        User: "Here's a summary of your content and recent activity."
    }

    const roleBadgeStyle = {
        Admin: isLight ? 'bg-red-100 text-red-700 border-red-200' : 'bg-red-900/30 text-red-400 border-red-800',
        Moderator: isLight ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-amber-900/30 text-amber-400 border-amber-800',
        User: isLight ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-blue-900/30 text-blue-400 border-blue-800',
    }

    const renderStatCard = (stat, index, delay = 0) => (
        <div
            key={index}
            className={`relative rounded-xl overflow-hidden ${
                isLight
                    ? 'bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg'
                    : 'bg-[#1C1C1C] shadow-lg hover:shadow-xl'
            } transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${delay + index * 100}ms` }}
        >
            <div className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 md:p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-md flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-3`}>
                        <FontAwesomeIcon icon={stat.icon} className="text-white text-lg md:text-xl" />
                    </div>
                </div>
                <div className="text-left">
                    <p className={`text-sm font-medium mb-2 leading-tight ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                        {stat.title}
                    </p>
                    <p className={`text-2xl md:text-3xl font-bold mb-2 leading-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        <CountUp end={stat.value} duration={2} />
                    </p>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        {stat.subtitle}
                    </p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header */}
            <div className={`mb-2 transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}>
                <div className="flex items-center gap-3 mb-3">
                    <h1 className={`text-3xl font-semibold ${isLight ? light.heading : dark.heading}`}>
                        Dashboard
                    </h1>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${roleBadgeStyle[role] || roleBadgeStyle.User}`}>
                        {role}
                    </span>
                </div>
                <p className={`text-sm leading-relaxed ${isLight ? light.text : dark.text}`}>
                    Welcome back, <span className="font-medium">{user?.username || 'User'}</span>! {headerMessages[role] || headerMessages.User}
                </p>
            </div>

            {/* Platform Stats — Admin/Moderator only */}
            {isStaff && platformStats.length > 0 && (
                <div>
                    <div className={`flex items-center gap-2 mb-4 transition-all duration-700 ease-out ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`} style={{ transitionDelay: '100ms' }}>
                        <FontAwesomeIcon icon={isAdmin ? faShieldHalved : faGavel} className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`} />
                        <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                            {isAdmin ? 'Platform Overview' : 'Moderation Overview'}
                        </h2>
                    </div>
                    <div className={`grid ${isAdmin ? 'lg:grid-cols-3 md:grid-cols-2' : 'lg:grid-cols-3 md:grid-cols-2'} grid-cols-1 gap-4 md:gap-6`}>
                        {platformStats.map((stat, i) => renderStatCard(stat, i, 100))}
                    </div>
                </div>
            )}

            {/* Content Stats — All roles */}
            <div>
                <div className={`flex items-center gap-2 mb-4 transition-all duration-700 ease-out ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`} style={{ transitionDelay: isStaff ? '500ms' : '100ms' }}>
                    <FontAwesomeIcon icon={faVideo} className={`text-sm ${isLight ? 'text-slate-500' : 'text-gray-500'}`} />
                    <h2 className={`text-sm font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
                        My Content
                    </h2>
                </div>
                <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 md:gap-6">
                    {userStats.map((stat, i) => renderStatCard(stat, i, isStaff ? 500 : 100))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className={`rounded-xl p-5 md:p-6 border transition-all duration-700 ease-out ${
                isLight
                    ? 'bg-white/80 backdrop-blur-sm border-blue-200/60 shadow-md hover:shadow-lg'
                    : 'bg-[#1C1C1C] border-[#2B2B2B] shadow-lg hover:shadow-xl'
            } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: isStaff ? '900ms' : '500ms' }}>
                <div className="mb-5 text-left">
                    <h2 className={`text-lg font-semibold mb-2 ${isLight ? light.heading : dark.heading}`}>
                        Recent Activity
                    </h2>
                    <p className={`text-xs leading-relaxed ${isLight ? light.text : dark.text}`}>
                        Latest updates from your account
                    </p>
                </div>
                <Table
                    theme={theme}
                    title=""
                    header={[
                        {
                            key: 'type',
                            label: 'Type',
                            render: (item) => {
                                const iconLookup = { Video: faVideo, Tag: faTag, Category: faFolder, Author: faUserPen }
                                return (
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon
                                            icon={iconLookup[item] || faTag}
                                            className={isLight ? 'text-blue-600' : 'text-blue-400'}
                                        />
                                        <span className="font-medium">{item}</span>
                                    </div>
                                )
                            }
                        },
                        { key: 'name', label: 'Name' },
                        { key: 'count', label: 'Usage/Views' },
                        {
                            key: 'createdAt',
                            label: 'Created At',
                            render: (item) => formatDate(item)
                        },
                        { key: 'actions', label: 'Action' },
                    ]}
                    actions={[
                        {
                            label: 'View',
                            color: `${isLight ? light.view_button : dark.view_button}`,
                            onClick: (item) => {
                                if(item.link) window.location.href = item.link
                            }
                        },
                    ]}
                    limit={5}
                    multipleSelect={false}
                    data={tableData}
                    setSelectedData={setSelectedData}
                    loading={loading}
                />
            </div>
        </div>
    )
}

export default Overview
