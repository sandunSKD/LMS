const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('Backend is running'));

// MongoDB Connection
const startDB = async () => {
    let uri = process.env.MONGODB_URI;
    
    if (!uri) {
        console.log('MONGODB_URI not found. Starting mongodb-memory-server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log('In-memory MongoDB started at:', uri);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        
        // Seed if memory server
        if (!process.env.MONGODB_URI) {
            const Class = mongoose.model('Class');
            const count = await Class.countDocuments();
            if (count === 0) {
                console.log('Seeding initial classes...');
                const seedClasses = [
                    {
                        name: 'React Fundamentals',
                        instructor: 'Dr. Sarah Smith',
                        type: 'theory',
                        lessons: ['Components & JSX', 'State & Props'],
                        timeTable: 'Mon, Wed - 10:00 AM',
                        place: 'Room 201',
                        duration: '12 weeks',
                        students: 150,
                        color: '#667eea',
                        mcqLink: ''
                    },
                    {
                        name: 'JavaScript Advanced',
                        instructor: 'Prof. Mike Johnson',
                        type: 'theory',
                        lessons: ['ES6+', 'Async'],
                        timeTable: 'Tue, Thu - 2:00 PM',
                        place: 'Room 305',
                        duration: '10 weeks',
                        students: 200,
                        color: '#764ba2',
                        mcqLink: ''
                    }
                ];
                await Class.insertMany(seedClasses);
                console.log('Database seeded!');
            }
        }
    } catch (err) {
        console.error('Could not connect to MongoDB', err);
    }
};

startDB();

// Class Schema
const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    instructor: { type: String, required: true },
    type: { type: String, enum: ['theory', 'revision', 'paper'], required: true },
    lessons: [String],
    timeTable: String,
    place: String,
    duration: String,
    students: { type: Number, default: 0 },
    color: { type: String, default: '#667eea' },
    mcqLink: { type: String, default: '' }
});

const Class = mongoose.model('Class', classSchema);

// Helper function to check for "pseudo-auth"
// In a real app, this would use JWT and properly verify the user
const checkTeacherSession = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (userRole === 'teacher' || userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Only teachers can perform this action.' });
    }
};

// Routes
app.use('/api/auth', authRoutes);

app.get('/api/classes', async (req, res) => {
    try {
        const classes = await Class.find();
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/classes', checkTeacherSession, async (req, res) => {
    const newClass = new Class(req.body);
    try {
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/classes/:id', checkTeacherSession, async (req, res) => {
    const { _id, __v, ...updateData } = req.body;
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedClass) return res.status(404).json({ message: 'Class not found' });
        res.json(updatedClass);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/classes/:id', checkTeacherSession, async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) return res.status(404).json({ message: 'Class not found' });
        res.json({ message: 'Class deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
