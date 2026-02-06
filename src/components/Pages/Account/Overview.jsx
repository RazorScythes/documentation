import React, { useEffect, useState } from 'react'
import { dark, light } from '../../../style';
import { useDispatch, useSelector } from 'react-redux'
import { getUserVideos } from '../../../actions/videos';
import { getTags } from '../../../actions/tags';
import { getCategory } from '../../../actions/category';
import { getAuthor } from '../../../actions/author';

import Table from '../../Custom/Table';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faTag, faFolder, faUser, faEye, faChartLine, faClock, faArrowUp, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import CountUp from 'react-countup';
import moment from 'moment';

const Overview = ({ user, theme }) => {
    const dispatch = useDispatch()

    const videos = useSelector((state) => state.videos.data)
    const tags = useSelector((state) => state.tags.data)
    const category = useSelector((state) => state.category.data)
    const author = useSelector((state) => state.author.data)
    const loading = useSelector((state) => state.videos.isLoading)

    const [tableData, setTableData] = useState([])
    const [selectedData, setSelectedData] = useState(null)
    const [overviewData, setOverviewData] = useState([])
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if(user) {
            dispatch(getUserVideos({
                id: user._id,
                type: 'video'
            }))
            dispatch(getTags({
                type: 'video'
            }))
            dispatch(getCategory({
                type: 'video'
            }))
            dispatch(getAuthor({
                type: 'video'
            }))
        }
    }, [user])

    useEffect(() => {
        // Trigger animation on mount
        setIsVisible(true)
    }, [])

    useEffect(() => {
        // Combine recent items from different sources
        const recentItems = []
        
        // Add recent videos
        if(Array.isArray(videos) && videos.length > 0) {
            videos.slice(0, 5).forEach(video => {
                recentItems.push({
                    _id: video._id,
                    type: 'Video',
                    name: video.title || video.name,
                    icon: faVideo,
                    count: video.views?.length || 0,
                    createdAt: video.createdAt,
                    link: `/account/videos`
                })
            })
        }

        // Add recent tags
        if(Array.isArray(tags) && tags.length > 0) {
            tags.slice(0, 3).forEach(tag => {
                recentItems.push({
                    _id: tag._id,
                    type: 'Tag',
                    name: tag.name,
                    icon: faTag,
                    count: tag.count || 0,
                    createdAt: tag.createdAt,
                    link: `/account/globallist`
                })
            })
        }

        // Add recent categories
        if(Array.isArray(category) && category.length > 0) {
            category.slice(0, 3).forEach(cat => {
                recentItems.push({
                    _id: cat._id,
                    type: 'Category',
                    name: cat.name,
                    icon: faFolder,
                    count: cat.count || 0,
                    createdAt: cat.createdAt,
                    link: `/account/globallist/categories`
                })
            })
        }

        // Sort by date (most recent first)
        recentItems.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0)
            const dateB = new Date(b.createdAt || 0)
            return dateB - dateA
        })

        const sortedData = recentItems.slice(0, 10)
        setOverviewData(sortedData)
        setTableData(sortedData)
    }, [videos, tags, category, author])

    const formatDate = (dateString) => {
        if(!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Ensure videos, tags, and category are arrays
    const videosArray = Array.isArray(videos) ? videos : []
    const tagsArray = Array.isArray(tags) ? tags : []
    const categoryArray = Array.isArray(category) ? category : []

    // Placeholder statistics data
    const stats = [
        {
            title: 'Total Videos',
            value: videosArray.length || 0,
            icon: faVideo,
            color: 'from-blue-500 to-sky-500',
            bgColor: 'bg-blue-500',
            change: '+12%',
            changeType: 'positive',
            subtitle: 'Last added 2 days ago'
        },
        {
            title: 'Total Tags',
            value: tagsArray.length || 0,
            icon: faTag,
            color: 'from-emerald-500 to-teal-500',
            bgColor: 'bg-emerald-500',
            change: '+8%',
            changeType: 'positive',
            subtitle: 'Last added 1 day ago'
        },
        {
            title: 'Total Categories',
            value: categoryArray.length || 0,
            icon: faFolder,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-500',
            change: '+5%',
            changeType: 'positive',
            subtitle: 'Last added 3 days ago'
        },
        {
            title: 'Total Views',
            value: videosArray.reduce((sum, video) => sum + (video.views?.length || 0), 0) || 0,
            icon: faEye,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500',
            change: '+24%',
            changeType: 'positive',
            subtitle: 'This month'
        }
    ]

    // Placeholder quick stats
    const quickStats = [
        { label: 'Most Viewed Video', value: 'Sample Video Title', icon: faArrowUp },
        { label: 'Most Used Tag', value: 'Sample Tag', icon: faTag },
        { label: 'Active Category', value: 'Sample Category', icon: faFolder },
        { label: 'Recent Activity', value: '5 items today', icon: faClock }
    ]

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header Section */}
            <div className={`mb-8 transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}>
                <h1 className={`text-3xl font-semibold mb-3 ${theme === 'light' ? light.heading : dark.heading}`}>
                    Dashboard Overview
                </h1>
                <p className={`text-sm leading-relaxed ${theme === 'light' ? light.text : dark.text}`}>
                    Welcome back! Here's what's happening with your account.
                </p>
            </div>

            {/* Statistics Cards Grid */}
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 md:gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`relative rounded-xl overflow-hidden border-l-4 ${
                            theme === 'light'
                                ? 'bg-white/80 backdrop-blur-sm border-blue-500 shadow-md hover:shadow-lg'
                                : 'bg-[#1C1C1C] border-blue-600 shadow-lg hover:shadow-xl'
                        } transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1 ${
                            isVisible 
                                ? 'opacity-100 translate-y-0' 
                                : 'opacity-0 translate-y-8'
                        }`}
                        style={{
                            animationDelay: `${index * 100}ms`,
                            transitionDelay: `${index * 100}ms`
                        }}
                    >
                        <div className="p-5 md:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 md:p-3 rounded-lg bg-gradient-to-br ${stat.color} shadow-md flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-3`}>
                                    <FontAwesomeIcon
                                        icon={stat.icon}
                                        className="text-white text-lg md:text-xl"
                                    />
                                </div>
                                <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                    stat.changeType === 'positive'
                                        ? theme === 'light'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-emerald-900/30 text-emerald-400'
                                        : theme === 'light'
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-rose-900/30 text-rose-400'
                                }`}>
                                    <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                                    {stat.change}
                                </div>
                            </div>
                            <div className="text-left">
                                <p className={`text-sm font-medium mb-2 leading-tight ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                                    {stat.title}
                                </p>
                                <p className={`text-2xl md:text-3xl font-bold mb-2 leading-tight ${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>
                                    <CountUp end={stat.value} duration={2} />
                                </p>
                                <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>
                                    {stat.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Stats and Recent Activity Section */}
            <div className="grid lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                {/* Quick Stats Card */}
                <div className={`lg:col-span-1 rounded-xl p-4 md:p-5 border transition-all duration-700 ease-out ${
                    theme === 'light'
                        ? 'bg-white/80 backdrop-blur-sm border-blue-200/60 shadow-md hover:shadow-lg'
                        : 'bg-[#1C1C1C] border-[#2B2B2B] shadow-lg hover:shadow-xl'
                } ${
                    isVisible 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 -translate-x-8'
                }`}
                style={{
                    transitionDelay: '300ms'
                }}>
                    <h2 className={`text-lg font-semibold mb-4 text-left ${theme === 'light' ? light.heading : dark.heading}`}>
                        Quick Stats
                    </h2>
                    <div className="space-y-2.5 md:space-y-3">
                        {quickStats.map((stat, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-3 p-2.5 md:p-3 rounded-lg transition-all duration-300 ease-out hover:scale-[1.02] hover:translate-x-1 ${
                                    theme === 'light'
                                        ? 'hover:bg-blue-50/50'
                                        : 'hover:bg-[#2B2B2B]'
                                } ${
                                    isVisible 
                                        ? 'opacity-100 translate-x-0' 
                                        : 'opacity-0 -translate-x-4'
                                }`}
                                style={{
                                    transitionDelay: `${400 + index * 50}ms`
                                }}
                            >
                                <div className={`p-2 rounded-lg flex-shrink-0 ${
                                    theme === 'light'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-blue-900/30 text-blue-400'
                                }`}>
                                    <FontAwesomeIcon icon={stat.icon} className="text-sm" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <p className={`text-xs font-medium mb-0.5 leading-tight ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                                        {stat.label}
                                    </p>
                                    <p className={`text-sm font-semibold truncate leading-tight ${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className={`lg:col-span-2 rounded-xl p-5 md:p-6 border transition-all duration-700 ease-out ${
                    theme === 'light'
                        ? 'bg-white/80 backdrop-blur-sm border-blue-200/60 shadow-md hover:shadow-lg'
                        : 'bg-[#1C1C1C] border-[#2B2B2B] shadow-lg hover:shadow-xl'
                } ${
                    isVisible 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 translate-x-8'
                }`}
                style={{
                    transitionDelay: '400ms'
                }}>
                    <div className="mb-5 text-left">
                        <h2 className={`text-lg font-semibold mb-2 ${theme === 'light' ? light.heading : dark.heading}`}>
                            Recent Activity
                        </h2>
                        <p className={`text-xs leading-relaxed ${theme === 'light' ? light.text : dark.text}`}>
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
                                render: (item, index) => {
                                    const fullItem = overviewData[index] || overviewData.find(i => i.type === item)
                                    return (
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon 
                                                icon={fullItem?.icon || faTag} 
                                                className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
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
                                color: `${theme === 'light' ? light.view_button : dark.view_button}`, 
                                onClick: (item) => {
                                    if(item.link) {
                                        window.location.href = item.link
                                    }
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

            {/* Activity Summary Section */}
            <div className={`rounded-xl p-5 md:p-6 border transition-all duration-700 ease-out ${
                theme === 'light'
                    ? 'bg-white/80 backdrop-blur-sm border-blue-200/60 shadow-md hover:shadow-lg'
                    : 'bg-[#1C1C1C] border-[#2B2B2B] shadow-lg hover:shadow-xl'
            } ${
                isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
            }`}
            style={{
                transitionDelay: '500ms'
            }}>
                <h2 className={`text-lg font-semibold mb-5 text-left ${theme === 'light' ? light.heading : dark.heading}`}>
                    Activity Summary
                </h2>
                <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                    <div className={`p-4 md:p-5 rounded-lg border text-left transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1 ${
                        theme === 'light'
                            ? 'bg-gradient-to-br from-blue-50/50 to-sky-50/50 border-blue-200/60 hover:shadow-md'
                            : 'bg-[#2B2B2B] border-[#1C1C1C] hover:shadow-lg'
                    } ${
                        isVisible 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-4'
                    }`}
                    style={{
                        transitionDelay: '600ms'
                    }}>
                        <div className="flex items-center gap-3 mb-3">
                            <FontAwesomeIcon
                                icon={faChartLine}
                                className={`text-lg flex-shrink-0 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
                            />
                            <p className={`font-semibold text-sm md:text-base leading-tight ${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>
                                Growth Rate
                            </p>
                        </div>
                        <p className={`text-2xl md:text-3xl font-bold mb-2 leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                            +18.5%
                        </p>
                        <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                            Compared to last month
                        </p>
                    </div>
                    <div className={`p-4 md:p-5 rounded-lg border text-left transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1 ${
                        theme === 'light'
                            ? 'bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-200/60 hover:shadow-md'
                            : 'bg-[#2B2B2B] border-[#1C1C1C] hover:shadow-lg'
                    } ${
                        isVisible 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-4'
                    }`}
                    style={{
                        transitionDelay: '700ms'
                    }}>
                        <div className="flex items-center gap-3 mb-3">
                            <FontAwesomeIcon
                                icon={faArrowUp}
                                className={`text-lg flex-shrink-0 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}
                            />
                            <p className={`font-semibold text-sm md:text-base leading-tight ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
                                Engagement
                            </p>
                        </div>
                        <p className={`text-2xl md:text-3xl font-bold mb-2 leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                            1,234
                        </p>
                        <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                            Total interactions this week
                        </p>
                    </div>
                    <div className={`p-4 md:p-5 rounded-lg border text-left transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1 ${
                        theme === 'light'
                            ? 'bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-purple-200/60 hover:shadow-md'
                            : 'bg-[#2B2B2B] border-[#1C1C1C] hover:shadow-lg'
                    } ${
                        isVisible 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-4'
                    }`}
                    style={{
                        transitionDelay: '800ms'
                    }}>
                        <div className="flex items-center gap-3 mb-3">
                            <FontAwesomeIcon
                                icon={faClock}
                                className={`text-lg flex-shrink-0 ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'}`}
                            />
                            <p className={`font-semibold text-sm md:text-base leading-tight ${theme === 'light' ? 'text-purple-700' : 'text-purple-400'}`}>
                                Last Activity
                            </p>
                        </div>
                        <p className={`text-2xl md:text-3xl font-bold mb-2 leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                            2h ago
                        </p>
                        <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                            Most recent update
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overview
