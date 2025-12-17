import { useState, useEffect } from 'react';
import { notificationAPI } from '../Axios/Axios';

interface Notification {
  _id: string;
  message_id: string;
  userid: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  for: string;
  createdAt: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onNotificationRead?: () => void;
}

function NotificationModal({ isOpen, onClose, userId, onNotificationRead }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [currentTime, setCurrentTime] = useState(new Date());
  const [showAll, setShowAll] = useState(false);

  // Load notifications when modal opens
  useEffect(() => {
    const loadNotifications = async () => {
      if (!isOpen || !userId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await notificationAPI.getMessagesByUserId(userId);
        if (response.data && response.data.data) {
          setNotifications(response.data.data);
        } else {
          setNotifications([]);
        }
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            error.message ||
            'Failed to load notifications'
        );
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
    setShowAll(false); // Reset khi mở modal
  }, [isOpen, userId]);

  const markAsRead = async (messageId: string) => {
    try {
      await notificationAPI.readMessage(messageId);
      // Cập nhật trạng thái local
      setNotifications(prev => 
        prev.map(notification => 
          notification.message_id === messageId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      // Gọi callback để thông báo cho component cha cập nhật số lượng chưa đọc
      onNotificationRead?.();
    } catch (err) {
      // Error handling
    }
  };

  // Cập nhật thời gian mỗi giây để realtime
  // useEffect(() => {
  //   if (!isOpen) return;
  //   const interval = setInterval(() => setCurrentTime(new Date()), 1000);
  //   return () => clearInterval(interval);
  // }, [isOpen]);

  // const handleMarkAsRead = async (messageId: string) => {
  //   try {
  //     await notificationAPI.markAsRead(messageId);
  //     setNotifications(prev =>
  //       prev.map(n =>
  //         n._id === messageId ? { ...n, isRead: true } : n
  //       )
  //     );
  //   } catch (error) {
  //     // Error handling
  //   }
  // };

  // const handleMarkAllAsRead = async () => {
  //   try {
  //     await notificationAPI.markAllAsRead(userId);
  //     setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  //   } catch (error) {
  //     // Error handling
//   }
  // };

  const formatTimeAgo = (dateString: string) => {
    try {
      const createdAt = new Date(dateString);
      const now = new Date();
      if (isNaN(createdAt.getTime())) return 'Thời gian không hợp lệ';
      
      // Backend đã cộng 7h, frontend cần trừ đi 7h để có thời gian chính xác
      const createdAtCorrected = new Date(createdAt.getTime() - (7 * 60 * 60 * 1000));
      const diffInMilliseconds = now.getTime() - createdAtCorrected.getTime();
      const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInDays > 0) return `${diffInDays}d`;
      if (diffInHours > 0) return `${diffInHours}h`;
      if (diffInMinutes > 0) return `${diffInMinutes}m`;
      return `${diffInSeconds}s`;
    } catch {
      return 'Thời gian không hợp lệ';
    }
  };

  if (!isOpen) return null;

  // Hiển thị 4 đầu tiên hoặc toàn bộ
  const displayNotifications = showAll
    ? notifications
    : notifications.slice(0, 4);
  const hasMore = notifications.length > 4;

  return (
    <div
      className="fixed inset-0 flex items-start justify-end z-50 pt-16 lg:pt-24 bg-black/20"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 shadow-xl border-l-2 border-gray-200 dark:border-gray-600 w-80 lg:w-96 h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)] rounded-l-xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-4 h-4 lg:w-5 lg:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col p-3 lg:p-4">
          {loading && (
            <div className="flex justify-center items-center py-6 lg:py-8">
              <div className="animate-spin rounded-full h-5 w-5 lg:h-6 lg:w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm lg:text-base text-gray-600">Loading...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 lg:p-4 mb-4">
<div className="flex items-center">
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5 text-red-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm lg:text-base text-red-800">{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="text-center py-6 lg:py-8">
              <div className="text-gray-400 text-3xl lg:text-4xl mb-3 lg:mb-4">🔔</div>
              <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
                No notifications yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs lg:text-sm">
                You'll see notifications here when they arrive.
              </p>
            </div>
          )}

          {!loading && !error && notifications.length > 0 && (
            <>
              {/* Danh sách thông báo có thể cuộn */}
              <div
                className={`flex-1 overflow-y-auto scroll-smooth transition-all duration-300 p-1 space-y-2 lg:space-y-3 ${
                  showAll ? 'max-h-[75vh] lg:max-h-[80vh]' : 'max-h-[60vh] lg:max-h-[65vh]'
                }`}
              >
                {displayNotifications.map(notification => (
                  <div
                    key={notification._id}
                    onClick={() => !notification.isRead && markAsRead(notification.message_id)}
                    className={`p-3 lg:p-4 rounded-lg border-2 transition-all duration-200 ${
                      notification.isRead 
                        ? 'cursor-default' 
                        : 'cursor-pointer hover:shadow-lg'
                    } ${
                      notification.isRead
                        ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-75'
                        : 'bg-white dark:bg-gray-800 border-purple-400 dark:border-purple-500 shadow-md'
                    }`}
                  >
                    <div>
                      <h3
                        className={`text-sm lg:text-base font-semibold mb-1 lg:mb-2 ${
                          notification.isRead
                            ? 'text-gray-600 dark:text-gray-400'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <p
className={`text-xs lg:text-sm mb-1 lg:mb-2 ${
                          notification.isRead
                            ? 'text-gray-500 dark:text-gray-500'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          notification.isRead
                            ? 'text-gray-400 dark:text-gray-600'
                            : 'text-violet-500'
                        }`}
                      >
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Nút Hiện tất cả / Thu gọn */}
              {hasMore && (
                <div className="mt-3 lg:mt-4">
                  <button
                    onClick={() => setShowAll(prev => !prev)}
                    className="w-full bg-gradient-to-r from-sky-300 to-violet-400 text-white px-3 lg:px-4 py-2 lg:py-3 rounded-lg hover:from-sky-400 hover:to-violet-500 transition-all text-sm lg:text-base font-medium"
                  >
                    {showAll ? 'Thu gọn' : 'Hiện tất cả'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;
