const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware for user validation
const fetchUser = async (req, res, next) => {
  try {
    const username = req.params.username || req.body.username;
    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const user = await User.findOne({ username: trimmedUsername });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user; // Attach user to the request object
    next();
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/users/login
 * Handles user login or registration.
 */
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim().toLowerCase();

    // Find or create the user
    let user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      user = new User({ username: trimmedUsername });
    }

    // Update lastLogin field
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/users/timer
 * Handles real-time timer synchronization.
 */
router.post('/timer', fetchUser, async (req, res) => {
  try {
    const { timeLeft, isWorkSession } = req.body;

    // Validate timer data
    if (timeLeft < 0) {
      return res.status(400).json({ error: 'Time left cannot be negative' });
    }

    // Update user's timer state
    req.user.remainingTime = timeLeft;
    req.user.isTimerRunning = timeLeft > 0;
    req.user.currentSessionType = isWorkSession ? 'work' : 'rest';
    await req.user.save();

    // Broadcast timer state via Socket.IO
    req.app.get('io').to(req.user.username).emit('timerUpdate', {
      username: req.user.username,
      timeLeft,
      isWorkSession,
    });

    res.status(200).json({ message: 'Timer state updated successfully' });
  } catch (err) {
    console.error('Error updating timer:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/users/update
 * Updates user statistics after a session ends.
 */
router.post('/update', fetchUser, async (req, res) => {
  try {
    const { sessionsCompleted = 0, focusMinutes = 0, restMinutes = 0 } = req.body;

    // Update user stats
    req.user.pomodoroSessions += sessionsCompleted;
    req.user.focusTime += focusMinutes;
    req.user.restTime += restMinutes;
    await req.user.save();

    // Broadcast updated stats via Socket.IO
    req.app.get('io').to(req.user.username).emit('statsUpdate', {
      username: req.user.username,
      pomodoroSessions: req.user.pomodoroSessions,
      focusTime: req.user.focusTime,
      restTime: req.user.restTime,
    });

    res.status(200).json(req.user);
  } catch (err) {
    console.error('Error updating user stats:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/users/:username
 * Fetches user info by username.
 */
router.get('/:username', fetchUser, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
