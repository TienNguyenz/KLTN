import React, { useEffect, useState, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';

const NotificationBell = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Lấy thông báo khi userId thay đổi
  useEffect(() => {
    if (userId) {
      console.log('Fetching notifications for user:', userId);
      axios.get(`/api/notifications/${userId}`)
        .then(res => {
          console.log('Notifications response:', res.data);
          // Lấy data từ response
          const notificationData = res.data.success ? res.data.data : [];
          setNotifications(notificationData);
          setUnreadCount(notificationData.filter(n => !n.user_notification_isRead).length);
        })
        .catch(error => {
          console.error('Error fetching notifications:', error);
          setNotifications([]);
          setUnreadCount(0);
        });
    }
  }, [userId]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đánh dấu là đã đọc khi click vào thông báo
  const markAsRead = async (notificationId) => {
    await axios.patch(`/api/notifications/${notificationId}/read`);
    setNotifications(notifications =>
      notifications.map(n =>
        n._id === notificationId ? { ...n, user_notification_isRead: true } : n
      )
    );
    setUnreadCount(count => count - 1);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <div
        style={{ cursor: 'pointer', position: 'relative' }}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <FaBell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -5,
            right: -5,
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: 12
          }}>
            {unreadCount}
          </span>
        )}
      </div>
      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 30,
            width: 350,
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: 8,
            zIndex: 1000,
            maxHeight: 400,
            overflowY: 'auto'
          }}
        >
          <div style={{ padding: 12, borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
            Thông báo mới
          </div>
          {notifications.length === 0 && (
            <div style={{ padding: 16, color: '#888' }}>Không có thông báo nào.</div>
          )}
          {notifications.map(n => (
            <div
              key={n._id}
              style={{
                padding: 12,
                background: n.user_notification_isRead ? '#f9f9f9' : '#e6f7ff',
                borderBottom: '1px solid #eee',
                cursor: 'pointer'
              }}
              onClick={() => markAsRead(n._id)}
              onMouseEnter={() => {
                if (!n.user_notification_isRead) markAsRead(n._id);
              }}
            >
              <div style={{ fontWeight: n.user_notification_isRead ? 'normal' : 'bold' }}>
                {n.user_notification_title}
              </div>
              <div style={{ fontSize: 13, color: '#555', margin: '4px 0' }}>
                {(() => {
                  const content = n.user_notification_content || '';
                  const [main, ...rest] = content.split('Nhận xét:');
                  const comment = rest.join('Nhận xét:').trim();
                  return (
                    <>
                      <span dangerouslySetInnerHTML={{ __html: main.replace(/\n/g, '<br/>') }} />
                      {comment && (
                        <div style={{ marginTop: 4 }}>
                          <b>Nhận xét:</b>
                          <span style={{ fontStyle: 'italic', color: '#1976d2', marginLeft: 4 }}>{comment}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <div style={{ fontSize: 11, color: '#aaa' }}>
                {new Date(n.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 