import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Update with your backend URL

function Dashboard({ username }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    // Join socket room
    socket.emit('join', username);

    // Fetch initial user data
    fetchUserData();

    // Listen for real-time updates
    socket.on('timerUpdate', handleRealTimeUpdate);

    // Cleanup on unmount
    return () => {
      socket.off('timerUpdate', handleRealTimeUpdate);
      socket.emit('leave', username);
    };
  }, [username, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user data:', err.message);
      setError('Unable to fetch user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRealTimeUpdate = (data) => {
    if (data.username === username) {
      fetchUserData(); // Fetch the latest data after a timer update
    }
  };

  if (loading) {
    return <p style={loadingStyle}>Loading data...</p>;
  }

  if (error) {
    return <p style={errorStyle}>{error}</p>;
  }

  return (
    <div style={containerStyle}>
      {/* Background Waves */}
      <div style={waveStyle}></div>
      <div style={{ ...waveStyle, animationDelay: '-2.5s', opacity: 0.7 }}></div>

      {/* Header */}
      <header style={headerStyle}>
        <h1>SIGMA TIMER</h1>
      </header>

      {/* Dashboard Content */}
      <div style={dashboardContainerStyle}>
        <h2>Welcome, {username}!</h2>

        {/* User Data Section */}
        {userData ? (
          <div style={personalDataStyle}>
            <p>Pomodoros Finished: <strong>{userData.pomodoroSessions}</strong></p>
            <p>Focus Time (min): <strong>{userData.focusTime}</strong></p>
            <p>Rest Time (min): <strong>{userData.restTime}</strong></p>
          </div>
        ) : (
          <p>No personal data available.</p>
        )}

        <button onClick={() => navigate('/timer')} style={buttonStyle}>
          Back to Timer
        </button>
      </div>
    </div>
  );
}

// Inline Styles
const containerStyle = {
  position: 'relative',
  textAlign: 'center',
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  zIndex: 1,
  backgroundColor: '#f8c7dc',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const waveStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '200%',
  height: '110%',
  background: '#a0c9f0',
  clipPath: 'polygon(0% 50%, 25% 55%, 50% 50%, 75% 55%, 100% 50%, 100% 100%, 0% 100%)',
  animation: 'wave-animation 5s infinite linear',
  zIndex: -1,
};

const headerStyle = {
  position: 'absolute',
  top: 0,
  left: '20px',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '20px',
};

const dashboardContainerStyle = {
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  padding: '30px',
  borderRadius: '8px',
  background: '#fff',
  maxWidth: '600px',
  width: '100%',
  margin: '0 auto',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const personalDataStyle = {
  marginBottom: '20px',
  lineHeight: '1.6',
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  borderRadius: '5px',
  backgroundColor: '#ff0099',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  marginTop: '20px',
  transition: 'background-color 0.3s',
};

const loadingStyle = {
  color: '#333',
  fontSize: '18px',
  textAlign: 'center',
};

const errorStyle = {
  color: 'red',
  fontSize: '18px',
  textAlign: 'center',
};

// Add keyframes dynamically
const styles = document.createElement('style');
styles.innerHTML = `
  @keyframes wave-animation {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
`;
document.head.appendChild(styles);

export default Dashboard;
