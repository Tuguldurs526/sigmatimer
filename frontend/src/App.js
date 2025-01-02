import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import Homepage from './pages/Homepage';
import PomodoroTimer from './pages/PomodoroTimer';
import Dashboard from './pages/Dashboard';

function App() {
  const [username, setUsername] = useState(null); // State to hold the logged-in username
  const [socket, setSocket] = useState(null); // State to manage the socket instance

  // Initialize the socket connection on mount
  useEffect(() => {
    const socketConnection = io('http://localhost:5000', {
      transports: ['websocket', 'polling'], // Fallback options for better compatibility
    });

    setSocket(socketConnection);

    // Debugging logs for connection status
    socketConnection.on('connect', () => {
      console.log('Socket connected:', socketConnection.id);
    });

    socketConnection.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    // Cleanup function to disconnect socket
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Join socket room whenever `username` is set
  useEffect(() => {
    if (socket && username) {
      socket.emit('join', username);
      console.log(`Joined room with username: ${username}`);
    }
  }, [socket, username]); // Re-run when `socket` or `username` changes

  return (
    <Router>
      <Routes>
        {/* Route for the homepage */}
        <Route
          path="/"
          element={<Homepage setUsername={setUsername} />}
        />

        {/* Route for the timer page */}
        <Route
          path="/timer"
          element={<PomodoroTimer username={username} socket={socket} />}
        />

        {/* Route for the dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard username={username} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
