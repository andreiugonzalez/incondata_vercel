// SocketContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { connectSocket, disconnectSocket } from './socket_project_service';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || '';
  const userId = useSelector((state) => state.user.user.id);

  const onUpdateUsers = useCallback(() => {
    // Optional: Implementar lógica adicional si es necesario cuando se actualizan los usuarios.
  }, []);

  useEffect(() => {
    if (userId && projectId) {
      const socketInstance = connectSocket(userId, projectId, null, onUpdateUsers);
      setSocket(socketInstance);

      return () => {
        disconnectSocket(userId, projectId);
      };
    }
  }, [userId, projectId, onUpdateUsers]);

  return (
    <SocketContext.Provider value={{ socket, error }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
