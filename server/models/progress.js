const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    pomodoroSessions: {
        type: Number,
        default: 0
    },
    workMinutes: {
        type: Number,
        default: 0
    },
    restMinutes: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Progress', ProgressSchema);
