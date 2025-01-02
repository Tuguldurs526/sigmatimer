import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Homepage({ setUsername }) {
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!name.trim()) {
      setErrorMsg('Username cannot be empty.');
      return;
    }
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsername(data.username);
        navigate('/timer');
      } else {
        setErrorMsg(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setErrorMsg(`Error: ${error.message}`);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Background Waves */}
      <div style={waveStyle}></div>
      <div style={{ ...waveStyle, animationDelay: '-2.5s', opacity: 0.7 }}></div>

      {/* Header */}
      <header style={headerStyle}>
        <h1>SIGMA TIMER</h1>
      </header>

      {/* Form Container */}
      <div style={formContainerStyle}>
        <h2>Enter your name to use the Pomodoro Timer!</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrorMsg('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLogin();
          }}
          placeholder="Your username"
          style={inputStyle}
        />
        <button onClick={handleLogin} style={buttonStyle}>
          Start
        </button>
        {errorMsg && <p style={errorStyle}>{errorMsg}</p>}
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
  zIndex: 2,
  fontSize: '20px',
  fontWeight: 'bold',
  padding: '20px',
};

const formContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 2,
  padding: '20px',
  background: '#fff',
  borderRadius: '10px',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
};

const inputStyle = {
  margin: '10px 0',
  padding: '10px',
  fontSize: '16px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  width: '100%',
  maxWidth: '300px',
};

const buttonStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  borderRadius: '5px',
  backgroundColor: '#ff0099',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  marginTop: '10px',
  transition: 'background-color 0.3s',
};

const errorStyle = {
  color: 'red',
  marginTop: '15px',
};

// Adding keyframes dynamically
const styles = document.createElement('style');
styles.innerHTML = `
  @keyframes wave-animation {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
`;
document.head.appendChild(styles);

export default Homepage;
