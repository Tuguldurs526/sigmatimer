const express = require('express');
const connectDB = require('./config/database');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5001; // Change to a different port

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static(path.join(__dirname, '../public')));

// Simple Route to Serve Home Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
