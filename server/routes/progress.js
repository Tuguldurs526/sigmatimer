const express = require('express');
const auth = require('../middleware/auth');
const Progress = require('../models/progress');
const router = express.Router();

// Get progress
router.get('/', auth, async (req, res) => {
    try {
        const progress = await Progress.find({ userId: req.user.id });
        res.json(progress);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Add or update progress
router.post('/', auth, async (req, res) => {
    const { date, pomodoroSessions, workMinutes, restMinutes } = req.body;

    try {
        let progress = await Progress.findOne({ userId: req.user.id, date });

        if (progress) {
            progress.pomodoroSessions += pomodoroSessions;
            progress.workMinutes += workMinutes;
            progress.restMinutes += restMinutes;
        } else {
            progress = new Progress({
                userId: req.user.id,
                date,
                pomodoroSessions,
                workMinutes,
                restMinutes
            });
        }

        await progress.save();
        res.json(progress);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
