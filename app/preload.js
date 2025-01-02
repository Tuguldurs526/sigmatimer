const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
let socket = null;

// Function to initialize Socket.IO client
const initializeSocket = () => {
  try {
    const io = require(path.resolve(__dirname, 'node_modules/socket.io-client')); // Ensure proper path resolution
    socket = io('http://localhost:5000'); // Replace with your backend's WebSocket URL
    console.log('✅ Socket.IO client initialized successfully');

    // Attach global error handlers
    attachGlobalErrorHandlers();
  } catch (error) {
    console.error('❌ Failed to initialize Socket.IO client:', error.message);
    socket = null; // Reset socket on error
  }
};

// Function to ensure Socket.IO is initialized
const ensureSocketInitialized = () => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Socket is not connected. Attempting to reinitialize...');
    initializeSocket();
  }
};

// Attach global error handlers for the socket
const attachGlobalErrorHandlers = () => {
  if (socket) {
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected to WebSocket after ${attemptNumber} attempts`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Disconnected from WebSocket: ${reason}`);
    });
  }
};

// Ensure the WebSocket is initialized when preload.js is loaded
initializeSocket();

// Expose Electron functionality and WebSocket methods
contextBridge.exposeInMainWorld('electron', {
  // IPC methods
  send: (channel, args) => {
    const validChannels = ['ping-backend'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, args);
      console.log(`✅ IPC message sent on channel: ${channel}`, args);
    } else {
      console.error(`❌ Invalid IPC channel: ${channel}`);
    }
  },
  invoke: (channel, args) => {
    const validChannels = ['ping-backend'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, args);
    }
    return Promise.reject(new Error(`❌ Invalid IPC channel: ${channel}`));
  },

  // WebSocket methods
  joinRoom: (username) => {
    ensureSocketInitialized();
    if (socket && username) {
      socket.emit('join', username);
      console.log(`✅ Joined room: ${username}`);
    } else {
      console.error(
        `❌ ${!socket ? 'Socket is not initialized' : 'Username is invalid'} for joinRoom`
      );
    }
  },
  onTimerUpdate: (callback) => {
    ensureSocketInitialized();
    if (socket && typeof callback === 'function') {
      socket.on('timerUpdate', callback);
      console.log('✅ Listener added for timerUpdate');
    } else {
      console.error(
        `❌ ${!socket ? 'Socket is not initialized' : 'Callback is invalid'} for onTimerUpdate`
      );
    }
  },
  offTimerUpdate: (callback) => {
    ensureSocketInitialized();
    if (socket && typeof callback === 'function') {
      socket.off('timerUpdate', callback);
      console.log('✅ Listener removed for timerUpdate');
    } else {
      console.error(
        `❌ ${!socket ? 'Socket is not initialized' : 'Callback is invalid'} for offTimerUpdate`
      );
    }
  },
  removeAllListeners: () => {
    ensureSocketInitialized();
    if (socket) {
      socket.removeAllListeners();
      console.log('✅ All listeners removed from WebSocket');
    } else {
      console.error('❌ Socket is not initialized for removeAllListeners');
    }
  },
  updateTimer: (data) => {
    ensureSocketInitialized();
    if (socket && data?.username) {
      socket.emit('timerUpdate', data);
      console.log(`✅ Timer update sent for username: ${data.username}`);
    } else {
      console.error(
        `❌ ${!socket ? 'Socket is not initialized' : 'Data is invalid'} for updateTimer`
      );
    }
  },

  // WebSocket status
  getSocketStatus: () => {
    ensureSocketInitialized();
    if (socket) {
      console.log('✅ Socket connected status:', socket.connected);
      return socket.connected;
    }
    console.error('❌ Socket is not initialized for getSocketStatus');
    return false;
  },

  // Disconnect WebSocket
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      console.log('✅ Disconnected from WebSocket');
    } else {
      console.error('❌ Socket is not initialized for disconnect');
    }
  },
});
