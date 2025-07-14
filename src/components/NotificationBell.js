'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaBell, FaCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL, getAuthHeaders } from '../utils/apiConfig';

export default function NotificationBell({ userId, isMobile = false }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  }, [API_URL, setLoading, setNotifications]);

  useEffect(() => {
    // Only fetch notifications if userId is provided
    if (userId) {
      fetchNotifications();
      
      // Set up polling to check for new notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [userId, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.put(
        `${API_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.put(
        `${API_URL}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.delete(
        `${API_URL}/api/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Handle notification click based on type
  const handleNotificationClick = async (notification) => {
    // Mark as read
    await markAsRead(notification._id);
    
    // Handle different types of notifications
    if ((notification.type === 'join_request' || notification.type === 'new_membership_request') && notification.relatedId) {
      // Navigate to community page with pending requests tab active
      window.location.href = `/communities/${notification.relatedId}?tab=join-requests`;
    } else if (notification.type === 'request_approved' || notification.type === 'request_rejected') {
      // Navigate to community page
      if (notification.relatedId) {
        window.location.href = `/communities/${notification.relatedId}`;
      }
    } else if (notification.type === 'new_community' && notification.relatedId) {
      // For Walmart admins: Navigate to admin page to approve community
      window.location.href = `/admin/dashboard?tab=communities&communityId=${notification.relatedId}`;
    } else if (notification.type === 'community_approved' && notification.relatedId) {
      // For community creators: Navigate to community page they created
      window.location.href = `/communities/${notification.relatedId}`;
    } else if (notification.type === 'community_rejected' && notification.relatedId) {
      // For community creators: Navigate to communities page to try again
      window.location.href = `/communities`;
    }
    // Add more types as needed
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications) {
        const bellElement = document.getElementById('notification-bell-container');
        if (bellElement && !bellElement.contains(event.target)) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, setShowNotifications]);

  return (
    <div className="relative" id="notification-bell-container">
      <button
        className={`relative ${
          isMobile 
            ? 'ml-2' 
            : 'p-3 rounded-full hover:bg-gray-100 transition-colors duration-200'
        } text-gray-600 hover:text-gray-900 focus:outline-none`}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <FaBell className={isMobile ? "text-xl" : "text-xl"} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`${
              isMobile 
                ? 'fixed inset-x-4 top-20 mx-auto' 
                : 'absolute right-0'
            } mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50`}
          >
            <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
              <h3 className="text-sm font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`p-3 border-b ${
                      !notification.isRead ? 'bg-blue-50' : 'bg-white'
                    } hover:bg-gray-50 cursor-pointer`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium flex items-center">
                        {!notification.isRead && (
                          <FaCircle className="text-blue-500 mr-2" size={8} />
                        )}
                        {notification.title}
                      </h4>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
