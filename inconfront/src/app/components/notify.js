import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Bell, ChevronDown, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { getNotificationsByProject, markAsRead, deleteNotification } from '../services/eventos_service';
import { useSocket } from '@/app/services/SocketContext';

const NotificationItem = ({ notification, onClick, onDelete, currentUser }) => {
  if (notification.deletedBy.includes(currentUser.id)) {
    return null;
  }

  return (
    <li
      className={`flex justify-between items-center p-2 border-b border-gray-200 last:border-0 cursor-pointer
      ${notification.readBy.includes(currentUser.id) ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-700'}
      ${notification.newFor.includes(currentUser.id) ? 'bg-blue-100 text-blue-700 font-bold' : ''}
      `}
      onClick={onClick}
    >
      <span className={`${!notification.readBy.includes(currentUser.id) ? 'font-bold' : ''}`}>{notification.resumen}</span>
      <button
        onClick={onDelete}
        className="ml-2 text-red-500 hover:text-red-900 focus:outline-none focus:ring focus:ring-red-200 transition-all ease-linear duration-150 hover:scale-110"
        aria-label="Eliminar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </li>
  );
};

const NotificationButton = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [allRead, setAllRead] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null); // Estado para la notificación seleccionada
  const [error, setError] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || '';
  const userId = useSelector((state) => state.user.user.id);
  const { socket } = useSocket();
  const modalRef = useRef(null);

  const checkAllRead = useCallback((notifications) => {
    const allRead = notifications.every(notification => notification.readBy.includes(userId) || !notification.newFor.includes(userId));
    setAllRead(allRead);
  }, [userId]);

  const updateNewNotificationsCount = useCallback((notifications) => {
    const newCount = notifications.filter(notification => !notification.readBy.includes(userId)).length;
    setNewNotificationsCount(newCount);
  }, [userId]);

  const markNotificationAsRead = useCallback(async (index) => {
    try {
      const notification = notifications[index];
      if (notification && !notification.readBy.includes(userId)) {
        await markAsRead(notification.id, userId);
        setNotifications(prevNotifications => {
          const updatedNotifications = [...prevNotifications];
          updatedNotifications[index].readBy.push(userId);
          updateNewNotificationsCount(updatedNotifications);
          checkAllRead(updatedNotifications);
          return updatedNotifications;
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [checkAllRead, userId, notifications, updateNewNotificationsCount]);

  const handleNotificationClick = useCallback((index) => {
    markNotificationAsRead(index);
    setSelectedNotification(notifications[index]); // Establecer la notificación seleccionada
  }, [markNotificationAsRead, notifications]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const clearNotifications = useCallback(async () => {
    try {
      await Promise.all(notifications.map(notification => {
        if (!notification.readBy.includes(userId)) {
          return markAsRead(notification.id, userId);
        }
        return null;
      }));
      setNotifications(prevNotifications => {
        return prevNotifications.map(notification => {
          if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
          }
          notification.newFor = notification.newFor.filter(id => id !== userId);
          return notification;
        });
      });
      setNewNotificationsCount(0);
      setAllRead(true);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [userId, notifications]);

  const deleteNotificationItem = useCallback(async (id, event) => {
    event.stopPropagation();
    try {
      await deleteNotification(id, userId);
      setNotifications(prevNotifications => {
        const updatedNotifications = prevNotifications.map(notification => {
          if (notification.id === id) {
            notification.deletedBy.push(userId);
          }
          return notification;
        }).filter(notification => !notification.deletedBy.includes(userId));
        updateNewNotificationsCount(updatedNotifications);
        return updatedNotifications;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [userId, updateNewNotificationsCount]);

  useEffect(() => {
    if (socket) {
      socket.on("notification", (newNotification) => {
        setNotifications(prevNotifications => {
          const updatedNotifications = [newNotification, ...prevNotifications];
          updateNewNotificationsCount(updatedNotifications);
          checkAllRead(updatedNotifications);
          return updatedNotifications;
        });
        setIsFlashing(true);
      });

      return () => {
        socket.off("notification");
      };
    }
  }, [socket, checkAllRead, updateNewNotificationsCount]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const fetchedNotifications = await getNotificationsByProject(projectId);

        console.log(fetchedNotifications);
        setNotifications(fetchedNotifications);
        updateNewNotificationsCount(fetchedNotifications);
        checkAllRead(fetchedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (projectId) {
      fetchNotifications();
    }
  }, [projectId, checkAllRead, userId, updateNewNotificationsCount]);

  useEffect(() => {
    if (isFlashing) {
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isFlashing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedNotification(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef]);

  const notificationItems = useMemo(() => {
    return notifications.map((notification, index) => (
      <NotificationItem
        key={notification.id}
        notification={notification}
        onClick={() => handleNotificationClick(index)}
        onDelete={(event) => deleteNotificationItem(notification.id, event)}
        currentUser={{ id: userId }}
      />
    ));
  }, [notifications, handleNotificationClick, deleteNotificationItem, userId]);

  const closeNotificationDetails = () => {
    setSelectedNotification(null);
  };

  return (
    <div className="relative z-30">
      <button
        type="button"
        onClick={toggleNotifications}
        className="relative flex items-center p-2 text-gray-600 bg-white rounded-lg shadow hover:bg-gray-50 focus:outline-none focus:ring focus:ring-gray-200"
        aria-label="Notificaciones"
      >
        {newNotificationsCount > 0 && (
          <span className="absolute font-zen-kaku top-0 left-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2">
            {newNotificationsCount}
          </span>
        )}
        <Bell className={`w-6 h-6 ml-2 ${isFlashing ? 'animate-swing stroke-yellow-300' : ''}`} />
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showNotifications ? 'transform rotate-180' : ''}`} />
      </button>

      {showNotifications && (
        <div className="absolute right-0 w-80 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 font-zen-kaku">
            <span className="text-gray-800 font-medium select-none">Notificaciones</span>
            <button
              onClick={clearNotifications}
              className="text-red-500 hover:text-red-900 font-bold focus:outline-none focus:ring focus:ring-red-200 transition-all ease-linear duration-150"
            >
              Marcar todo como leído
            </button>
          </div>
          <ul className="p-4 max-h-60 overflow-y-auto font-zen-kaku">
            {notifications.length > 0 ? (
              notificationItems
            ) : (
              <li className="p-2 text-gray-700">No hay notificaciones</li>
            )}
          </ul>
        </div>
      )}

{selectedNotification && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-75 transition-opacity">
    <div
      ref={modalRef}
      className="bg-white p-6 rounded-lg shadow-2xl mx-auto space-y-4 border border-gray-200 resize overflow-auto flex flex-col"
      style={{ resize: 'both', width: '800px', height: '600px' }}  // Tamaño inicial aumentado
    >
      <div className="flex justify-between items-center border-b pb-3 mb-4 font-zen-kaku">
        <div className="text-sm text-gray-500">{new Date(selectedNotification.fecha).toLocaleString()}</div>
        <button
          onClick={closeNotificationDetails}
          className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-all ease-linear duration-150 hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div className="flex flex-col space-y-3 flex-grow font-zen-kaku">
        <div className="flex items-center justify-start space-x-2">
          <div className="text-lg font-medium text-gray-800">Resumen:</div>
          <div className="text-gray-700">{selectedNotification.resumen}</div>
        </div>
        <div className="flex flex-col space-x-2 flex-grow">
          <div className="text-lg font-medium text-gray-800">Descripción:</div>
          <textarea
            className="w-full h-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-300 resize-none flex-grow"
            defaultValue={selectedNotification.message}
            readOnly
          ></textarea>
        </div>
      </div>
      <div className="flex justify-between items-center pt-3 mt-4 border-t font-zen-kaku">
        <div className="text-sm text-gray-500">{selectedNotification.user.names} {selectedNotification.user.apellido_p} {selectedNotification.user.apellido_m}</div>
      </div>
    </div>
  </div>
)}







    </div>
  );
};

export default NotificationButton;
