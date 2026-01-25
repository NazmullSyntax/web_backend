const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const noteRoutes = require('./routes/note.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/auth', authRoutes);
app.use('/api/notes', noteRoutes);

module.exports = app;