import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  GraduationCap, 
  Calendar, 
  ClipboardList, 
  Sparkles, 
  Trash2, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotificationStore from '../../Store/notificationStore';
import { formatDistanceToNow } from 'date-fns';

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Recently';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Recently';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return 'Recently';
  }
};

const cleanTitle = (title) => {
  if (!title) return '';
  return title.replace(/^[\p{Emoji}\u200d\uFE0F\s]+/gu, '').trim();
};

const getNotificationRealImage = (notif) => {
  if (notif.image) return notif.image;
  switch (notif.type) {
    case 'test':
      return '/thumb_class10_science.jpg';
    case 'batch':
      return '/batch_banner.jpg';
    case 'scholarship':
    case 'info':
    default:
      return '/logo.svg';
  }
};

const NotificationDropdown = ({ isDark = false, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const { 
    notifications = [], 
    unreadCount = 0, 
    markAsRead, 
    markSingleAsRead,
    removeNotification, 
    clearNotifications,
    restoreDefaults,
    fetchNotifications 
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleItemClick = (notif) => {
    markSingleAsRead(notif.id);
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const positionClasses = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Open notifications"
        className={`relative p-2 rounded-full transition-colors cursor-pointer ${
          isDark 
            ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        } ${isOpen ? (isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900') : ''}`}
      >
        <Bell size={20} className={unreadCount > 0 ? 'text-[#FB0500]' : ''} />
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FB0500] text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Box - Sharp rounded-sm, subtle border, no heavy shadow, stays in corner */}
      {isOpen && (
        <div 
          className={`absolute ${positionClasses} mt-2 w-76 sm:w-80 rounded-sm border shadow-md transition-all z-[120] overflow-hidden ${
            isDark 
              ? 'bg-gray-900 border-gray-800 text-gray-100' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-3.5 py-2.5 border-b ${
            isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'
          }`}>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-semibold bg-red-50 text-[#FB0500] border border-red-100">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {unreadCount > 0 && (
                <button 
                  type="button"
                  onClick={markAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  title="Mark all as read"
                >
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  type="button"
                  onClick={clearNotifications}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Clear all"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No notifications yet</p>
                <button
                  type="button"
                  onClick={restoreDefaults}
                  className="mt-2 text-[11px] text-blue-600 hover:underline cursor-pointer"
                >
                  Load announcements
                </button>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = notif.isRead === false;
                const realImg = getNotificationRealImage(notif);
                const isSvg = realImg.endsWith('.svg');

                return (
                  <div 
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`group relative px-3.5 py-2.5 transition-colors cursor-pointer flex gap-2.5 items-start ${
                      isUnread 
                        ? (isDark ? 'bg-gray-800/40 hover:bg-gray-800' : 'bg-red-50/20 hover:bg-red-50/50') 
                        : (isDark ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50')
                    }`}
                  >
                    {/* Real Brand / Course Icon */}
                    <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <img 
                        src={realImg} 
                        alt="" 
                        className={`w-full h-full ${isSvg ? 'object-contain p-1' : 'object-cover'}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/logo.svg';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs truncate ${
                          isUnread 
                            ? 'font-bold text-gray-900 dark:text-white' 
                            : 'font-medium text-gray-700 dark:text-gray-300'
                        }`}>
                          {cleanTitle(notif.title)}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                          {formatRelativeTime(notif.timestamp || notif.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-[11px] leading-relaxed line-clamp-2 text-gray-500 dark:text-gray-400">
                        {notif.message}
                      </p>

                      {notif.link && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#FB0500]">
                          <span>View Details</span>
                          <ArrowRight size={10} />
                        </div>
                      )}
                    </div>

                    {/* Unread dot / Dismiss */}
                    <div className="flex flex-col items-center justify-between self-stretch flex-shrink-0 pt-0.5">
                      {isUnread ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FB0500]" title="Unread" />
                      ) : (
                        <span className="w-1.5 h-1.5" />
                      )}
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notif.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-0.5 cursor-pointer mt-auto"
                        title="Dismiss"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className={`px-3.5 py-2 border-t flex items-center justify-between ${
              isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50/50'
            }`}>
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Recent Alerts
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/comingbatches');
                }}
                className="text-[11px] font-semibold text-[#FB0500] hover:underline cursor-pointer"
              >
                View Batches →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
