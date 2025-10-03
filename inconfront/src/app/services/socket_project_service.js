import io from 'socket.io-client';

let socket;

const registerUserToProject = (userId, projectId) => {
  if (projectId) {
    socket.emit('register', userId, projectId);
    console.log(`Emitted register event for user ${userId} on project ${projectId}`);
  }
};

export const connectSocket = (userId, projectId, onConnect, onUpdateUsers) => {
  socket = io(process.env.NEXT_PUBLIC_FAENA_BACKEND_SOCKET_HOST, {
    reconnectionAttempts: 10,
    reconnectionDelay: 5000,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    registerUserToProject(userId, projectId);
    if (onConnect) {
      onConnect();
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('reconnect', () => {
    console.log('Socket reconnected');
    registerUserToProject(userId, projectId);
  });

  socket.on('update-users', onUpdateUsers);

  socket.on('error', (error) => {
    console.error('Socket encountered an error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = (userId, projectId) => {
  if (socket) {
    socket.emit('unregister', userId, projectId);
    console.log(`Emitted unregister event for user ${userId} on project ${projectId}`);
    socket.disconnect();
  }
};
