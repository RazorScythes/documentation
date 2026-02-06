import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { convertDriveImageLink } from '../Tools';
import { dark, light } from '../../style';
import Avatar from '../../assets/avatar.webp';

const NotificationDropdown = ({ theme, notifications = [], onClose, onNotificationClick }) => {
    // Sample notifications if none provided
    const sampleNotifications = notifications.length > 0 ? notifications : [
        {
            id: 1,
            avatar: '',
            name: 'John Doe',
            timestamp: '2 hours ago',
            message: 'Liked your video "Introduction to React"',
            read: false
        },
        {
            id: 2,
            avatar: '',
            name: 'Jane Smith',
            timestamp: '5 hours ago',
            message: 'Commented on your post',
            read: false
        },
        {
            id: 3,
            avatar: '',
            name: 'Admin',
            timestamp: '1 day ago',
            message: 'Your video has been approved',
            read: true
        }
    ];

    const formatTime = (timestamp) => {
        return timestamp;
    };

    return (
        <div className={`relative sm:absolute sm:z-50 sm:top-2 sm:right-0 w-full sm:w-96 max-w-sm max-h-[32rem] overflow-y-auto rounded-lg shadow-xl border ${theme === 'light' ? 'bg-white/95 backdrop-blur-sm border-blue-200/60' : 'bg-[#1C1C1C] border-[#2B2B2B]'}`}>
            <div className={`sticky top-0 ${theme === 'light' ? 'bg-white/95 backdrop-blur-sm border-b border-blue-200/60' : 'bg-[#1C1C1C] border-b border-[#2B2B2B]'} px-4 py-3 flex items-center justify-between`}>
                <h3 className={`font-semibold text-lg ${theme === 'light' ? 'text-blue-700' : 'text-white'}`}>
                    Notifications
                </h3>
                <button
                    onClick={onClose}
                    className={`p-1 rounded-md transition-all ${theme === 'light' ? 'text-blue-600 hover:bg-blue-100/50' : 'text-gray-400 hover:bg-[#2B2B2B]'}`}
                >
                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
            </div>

            <div className="divide-y divide-solid">
                {sampleNotifications.length === 0 ? (
                    <div className={`px-4 py-8 text-center ${theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                        <p>No notifications</p>
                    </div>
                ) : (
                    sampleNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => onNotificationClick && onNotificationClick(notification)}
                            className={`px-4 py-3 cursor-pointer transition-all ${
                                theme === 'light' 
                                    ? 'hover:bg-blue-50/50' 
                                    : 'hover:bg-[#2B2B2B]'
                            } ${
                                !notification.read 
                                    ? (theme === 'light' ? 'bg-blue-50/30' : 'bg-[#2B2B2B]/50') 
                                    : ''
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <img
                                        src={notification.avatar ? convertDriveImageLink(notification.avatar) : Avatar}
                                        alt={notification.name}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className={`font-semibold text-sm truncate ${theme === 'light' ? 'text-blue-700' : 'text-white'}`}>
                                            {notification.name}
                                        </p>
                                        {!notification.read && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                                        )}
                                    </div>
                                    <p className={`text-xs mb-1 ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                                        {formatTime(notification.timestamp)}
                                    </p>
                                    <p className={`text-sm line-clamp-2 ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {sampleNotifications.length > 0 && (
                <div className={`sticky bottom-0 ${theme === 'light' ? 'bg-white/95 backdrop-blur-sm border-t border-blue-200/60' : 'bg-[#1C1C1C] border-t border-[#2B2B2B]'} px-4 py-3 text-center`}>
                    <button
                        className={`text-sm font-medium transition-all ${theme === 'light' ? 'text-blue-600 hover:text-blue-700' : 'text-blue-400 hover:text-blue-300'}`}
                    >
                        View All Notifications
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
