const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());  // Allow frontend to connect
app.use(express.json());  // Parse JSON requests
app.use('/uploads', express.static('uploads'));  // Serve uploaded files

// MongoDB Connection (Local)
mongoose.connect('mongodb://127.0.0.1:27017/notes-app')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

// Note Schema
const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'personal' },
    priority: { type: String, default: 'medium' },
    status: { type: String, default: 'active' },
    tags: [String],
    attachments: [{
        filename: String,
        path: String,
        mimetype: String,
        size: Number
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Note = mongoose.model('Note', noteSchema);

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No authentication token' });
        }

        // In development, use a simple token
        const user = await User.findById(token);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// ==================== AUTH ROUTES ====================
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();

        // Create token (using user ID as token for simplicity)
        const token = user._id.toString();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create token (using user ID)
        const token = user._id.toString();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== NOTES ROUTES ====================
// GET all notes
app.get('/api/notes', auth, async (req, res) => {
    try {
        const notes = await Note.find({ createdBy: req.userId, status: { $ne: 'deleted' } })
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: notes
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single note
app.get('/api/notes/:id', auth, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            createdBy: req.userId
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create note
app.post('/api/notes', auth, async (req, res) => {
    try {
        const { title, content, category, priority, tags } = req.body;
        
        const note = new Note({
            title,
            content,
            category: category || 'personal',
            priority: priority || 'medium',
            tags: tags || [],
            createdBy: req.userId
        });

        await note.save();

        res.status(201).json({
            success: true,
            data: note
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update note
app.put('/api/notes/:id', auth, async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.userId
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE note
app.delete('/api/notes/:id', auth, async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.userId
            },
            { status: 'deleted' },
            { new: true }
        );

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SEARCH notes
app.get('/api/notes/search', auth, async (req, res) => {
    try {
        const { q, category, priority, tag } = req.query;
        const query = { createdBy: req.userId, status: { $ne: 'deleted' } };

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } }
            ];
        }

        if (category) query.category = category;
        if (priority) query.priority = priority;
        if (tag) query.tags = tag;

        const notes = await Note.find(query).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: notes
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE note status
app.patch('/api/notes/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        
        const note = await Note.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.userId
            },
            { status },
            { new: true }
        );

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE all notes
app.delete('/api/notes', auth, async (req, res) => {
    try {
        await Note.updateMany(
            { createdBy: req.userId },
            { status: 'deleted' }
        );

        res.json({
            success: true,
            message: 'All notes marked as deleted'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
});