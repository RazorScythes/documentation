import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faCheckDouble, faTrash, faBroom, faHeart, faComment, faReply, faUserPlus, faAt, faBell, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { convertDriveImageLink } from '../Tools';
import { dark, light } from '../../style';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../assets/avatar.webp';

const TYPE_ICONS = {
    like: faHeart,
    comment: faComment,
    reply: faReply,
    subscribe: faUserPlus,
    mention: faAt,
    system: faBell
};

const TYPE_COLORS = {
    like: 'text-rose-500',
    comment: 'text-blue-500',
    reply: 'text-emerald-500',
    subscribe: 'text-violet-500',
    mention: 'text-amber-500',
    system: 'text-gray-400'
};

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return date.toLocaleDateString();
}

const NotificationDropdown = ({
    theme,
    notifications = [],
    unreadCount = 0,
    isLoading = false,
    hasMore = false,
    onClose,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onClearAll,
    onLoadMore
}) => {
    const navigate = useNavigate();
    const isLight = theme === 'light';

    const handleClick = (notification) => {
        if (!notification.read && onMarkAsRead) {
            onMarkAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
            onClose?.();
        }
    };

    return (
        <div className={`relative sm:absolute sm:z-50 sm:top-2 sm:right-0 w-full sm:w-[22rem] max-h-[32rem] flex flex-col rounded-xl shadow-2xl border ${isLight ? 'bg-white/95 backdrop-blur-sm border-blue-200/60' : 'bg-[#0e0e0e] border-[#2B2B2B]'}`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 ${isLight ? 'bg-white/95 backdrop-blur-sm border-b border-blue-200/60' : 'bg-[#0e0e0e] border-b border-[#2B2B2B]'} px-4 py-3 flex items-center justify-between rounded-t-xl`}>
                <div className="flex items-center gap-2">
                    <h3 className={`font-semibold text-base ${isLight ? 'text-blue-700' : 'text-white'}`}>
                        Notifications
                    </h3>
                    {unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            title="Mark all as read"
                            className={`p-1.5 rounded-md transition-all text-xs ${isLight ? 'text-blue-600 hover:bg-blue-100/50' : 'text-blue-400 hover:bg-[#2B2B2B]'}`}
                        >
                            <FontAwesomeIcon icon={faCheckDouble} />
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={onClearAll}
                            title="Clear all"
                            className={`p-1.5 rounded-md transition-all text-xs ${isLight ? 'text-slate-500 hover:bg-red-100/50 hover:text-red-600' : 'text-gray-500 hover:bg-red-900/20 hover:text-red-400'}`}
                        >
                            <FontAwesomeIcon icon={faBroom} />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-md transition-all text-xs ${isLight ? 'text-slate-400 hover:bg-blue-100/50 hover:text-blue-600' : 'text-gray-500 hover:bg-[#2B2B2B] hover:text-white'}`}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 && !isLoading ? (
                    <div className={`px-4 py-12 text-center ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                        <FontAwesomeIcon icon={faBell} className="text-3xl mb-3 opacity-40" />
                        <p className="text-sm font-medium">No notifications yet</p>
                        <p className="text-xs mt-1 opacity-70">We'll notify you when something happens</p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`group relative px-3 py-3 cursor-pointer transition-all border-b last:border-b-0 ${isLight ? 'border-blue-100/40' : 'border-[#1C1C1C]'} ${
                                    !notification.read
                                        ? (isLight ? 'bg-blue-50/40' : 'bg-blue-900/10')
                                        : ''
                                } ${isLight ? 'hover:bg-blue-50/60' : 'hover:bg-[#1C1C1C]'}`}
                                onClick={() => handleClick(notification)}
                            >
                                <div className="flex items-start gap-2.5">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={notification.sender?.avatar ? convertDriveImageLink(notification.sender.avatar) : Avatar}
                                            alt=""
                                            className="w-9 h-9 rounded-full object-cover border border-blue-200/40"
                                        />
                                        <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${isLight ? 'bg-white shadow-sm' : 'bg-[#0e0e0e]'}`}>
                                            <FontAwesomeIcon icon={TYPE_ICONS[notification.type] || faBell} className={TYPE_COLORS[notification.type] || 'text-gray-400'} />
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0 pr-6">
                                        <p className={`text-[13px] leading-snug ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                                            <span className={`font-semibold ${isLight ? 'text-blue-700' : 'text-white'}`}>
                                                {notification.sender?.username || 'System'}
                                            </span>
                                            {' '}
                                            {notification.message}
                                        </p>
                                        <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                            {timeAgo(notification.createdAt)}
                                        </p>
                                    </div>

                                    {!notification.read && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                    )}
                                </div>

                                {/* Hover actions */}
                                <div className={`absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 ${isLight ? 'bg-white/90' : 'bg-[#0e0e0e]/90'} rounded-md shadow-sm px-0.5`}>
                                    {!notification.read && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onMarkAsRead?.(notification._id); }}
                                            title="Mark as read"
                                            className={`p-1 rounded text-[10px] transition-all ${isLight ? 'text-blue-500 hover:bg-blue-50' : 'text-blue-400 hover:bg-[#2B2B2B]'}`}
                                        >
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete?.(notification._id); }}
                                        title="Remove"
                                        className={`p-1 rounded text-[10px] transition-all ${isLight ? 'text-rose-500 hover:bg-rose-50' : 'text-red-400 hover:bg-red-900/20'}`}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className={`px-4 py-3 text-center ${isLight ? 'text-blue-500' : 'text-blue-400'}`}>
                                <FontAwesomeIcon icon={faSpinner} spin className="text-sm" />
                            </div>
                        )}

                        {hasMore && !isLoading && (
                            <div className={`px-4 py-2.5 text-center border-t ${isLight ? 'border-blue-100/40' : 'border-[#1C1C1C]'}`}>
                                <button
                                    onClick={onLoadMore}
                                    className={`text-xs font-medium transition-all ${isLight ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'}`}
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
