import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function PomodoroTimer({ username, socket }) {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default: 25 minutes for work
  const [workDuration, setWorkDuration] = useState(25); // Work duration in minutes
  const [restDuration, setRestDuration] = useState(5); // Rest duration in minutes
  const [showPopup, setShowPopup] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0); // Tracks completed sessions
  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }
  }, [username, navigate]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleSessionEnd();
            return 0;
          }
          emitTimerUpdate(prevTime - 1, isWorkSession);
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // WebSocket integration
  useEffect(() => {
    if (socket) {
      const handleTimerUpdate = (data) => {
        if (data?.username === username) {
          setTimeLeft(data.timeLeft);
          setIsWorkSession(data.isWorkSession);
        }
      };

      socket.on('timerUpdate', handleTimerUpdate);

      return () => socket.off('timerUpdate', handleTimerUpdate);
    }
  }, [socket, username]);

  // Electron integration
  useEffect(() => {
    if (window.electron && window.electron.joinRoom && window.electron.onTimerUpdate) {
      const { joinRoom, onTimerUpdate, removeAllListeners } = window.electron;

      joinRoom(username);

      const timerUpdateListener = (data) => {
        if (data.username === username) {
          setTimeLeft(data.timeLeft);
          setIsWorkSession(data.isWorkSession);
        }
      };

      onTimerUpdate(timerUpdateListener);

      return () => removeAllListeners('timerUpdate');
    }
  }, [username]);

  const handleSessionEnd = async () => {
    if (isWorkSession) {
      await updateUserStats(); // Update stats for work session
      setSessionsCompleted((prev) => prev + 1); // Increment completed sessions
      setShowPopup(true);
    } else {
      switchSession(); // Switch to work session
    }

    setIsRunning(false);
    emitTimerUpdate(timeLeft, isWorkSession);
  };

  const switchSession = () => {
    setIsWorkSession((prev) => !prev);
    setTimeLeft(isWorkSession ? restDuration * 60 : workDuration * 60);
  };

  const handleStartPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isWorkSession ? workDuration * 60 : restDuration * 60);
    emitTimerUpdate(isWorkSession ? workDuration * 60 : restDuration * 60, isWorkSession);
  };

  const emitTimerUpdate = (time, session) => {
    const timerData = {
      username,
      timeLeft: time,
      isWorkSession: session,
    };

    if (socket) {
      socket.emit('timerUpdate', timerData);
    }

    if (window.electron) {
      window.electron.updateTimer(timerData);
    }
  };

  const updateUserStats = async () => {
    try {
      const data = {
        username,
        sessionsCompleted: 1,
        focusMinutes: isWorkSession ? workDuration : 0,
        restMinutes: isWorkSession ? 0 : restDuration,
      };

      const response = await fetch('http://localhost:5000/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to update user stats:', await response.text());
      }
    } catch (err) {
      console.error('Error updating user stats:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const strokeDashoffset =
    circumference - (timeLeft / (isWorkSession ? workDuration : restDuration) / 60) * circumference;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1>SIGMA TIMER</h1>
        <p style={usernameStyle}>{username}</p>
      </header>

      <main style={mainStyle}>
        <h2>{isWorkSession ? 'Work Time' : 'Rest Time'}</h2>
        <div style={circleContainerStyle}>
          <svg width="300" height="300">
            <circle
              stroke={isWorkSession ? 'green' : 'red'}
              fill="transparent"
              strokeWidth="10"
              r={radius}
              cx="150"
              cy="150"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: 'stroke-dashoffset 1s linear',
              }}
            />
          </svg>
          <div style={timeOverlayStyle}>{formatTime(timeLeft)}</div>
        </div>

        <div style={buttonsContainerStyle}>
          <button onClick={handleStartPause} style={buttonStyle}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button onClick={handleReset} style={buttonStyle}>
            Reset
          </button>
          <button onClick={() => navigate('/dashboard')} style={buttonStyle}>
            Dashboard
          </button>
          <button onClick={() => navigate('/')} style={buttonStyle}>
            Home
          </button>
        </div>

        <div style={inputContainerStyle}>
          <label>
            Work (min):
            <input
              type="number"
              min="1"
              max="60"
              value={workDuration}
              onChange={(e) => {
                const value = Math.max(1, Math.min(60, +e.target.value));
                setWorkDuration(value);
                if (isWorkSession) setTimeLeft(value * 60);
              }}
              style={inputStyle}
            />
          </label>
          <label>
            Rest (min):
            <input
              type="number"
              min="1"
              max="30"
              value={restDuration}
              onChange={(e) => {
                const value = Math.max(1, Math.min(30, +e.target.value));
                setRestDuration(value);
                if (!isWorkSession) setTimeLeft(value * 60);
              }}
              style={inputStyle}
            />
          </label>
        </div>
      </main>

      {showPopup && (
        <div style={popupOverlayStyle}>
          <div style={popupContentStyle}>
            <h3>Work session completed!</h3>
            <p>Ready to start rest time?</p>
            <button
              onClick={() => {
                setShowPopup(false);
                switchSession();
              }}
              style={buttonStyle}
            >
              Start Rest
            </button>
            <button onClick={() => setShowPopup(false)} style={buttonStyle}>
              Skip Rest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  position: 'relative',
  textAlign: 'center',
  width: '100%',
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: '#f8c7dc',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
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

const usernameStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  fontSize: '18px',
};

const mainStyle = {
  position: 'relative',
  textAlign: 'center',
  margin: '0 auto',
  maxWidth: '600px',
};

const circleContainerStyle = {
  position: 'relative',
  margin: '20px auto',
  width: '300px',
  height: '300px',
};

const timeOverlayStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '24px',
  fontWeight: 'bold',
};

const buttonsContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  margin: '20px 0',
};

const inputContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '10px',
  marginTop: '20px',
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  borderRadius: '5px',
  backgroundColor: '#ff0099',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
};

const inputStyle = {
  margin: '10px',
  padding: '10px',
  fontSize: '16px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  width: '50%',
};

const popupOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
};

const popupContentStyle = {
  background: '#fff',
  padding: '30px',
  borderRadius: '8px',
  textAlign: 'center',
};

export default PomodoroTimer;
