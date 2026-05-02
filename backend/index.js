const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Log environment setup
console.log('[SERVER STARTUP] Environment Variables Loaded:');
console.log('[SERVER STARTUP] PORT:', process.env.PORT);
console.log('[SERVER STARTUP] GROQ_API_KEY:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) + '...' : 'NOT SET');

// Helper function to call Groq API
async function callGroqAPI(notes) {
    return new Promise((resolve, reject) => {
        const requestData = JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert educational tutor. Provide comprehensive summaries of student notes in the following structured format:

**Key Concepts:**
• First key concept
• Second key concept
• Third key concept

**Important Points:**
• Critical point 1
• Critical point 2
• Critical point 3

**Study Tips:**
• Tip 1
• Tip 2
• Tip 3

Use bullet points (•) for all items. Keep each bullet point concise (under 15 words). Format section headers with **bold** text.`
                },
                {
                    role: 'user',
                    content: `Please provide a comprehensive summary of the following notes:\n\n${notes}`
                }
            ],
            model: 'mixtral-8x7b-32768',
            temperature: 0.5,
            max_tokens: 1024,
        });

        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    console.log('[GROQ RESPONSE] Status:', res.statusCode);
                    console.log('[GROQ RESPONSE] Data:', data.substring(0, 200) + '...');
                    
                    const parsed = JSON.parse(data);
                    if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
                        resolve(parsed.choices[0].message.content);
                    } else if (parsed.error) {
                        reject(new Error(`Groq API Error: ${parsed.error.message}`));
                    } else {
                        reject(new Error(`Invalid response format from Groq API: ${JSON.stringify(parsed)}`));
                    }
                } catch (e) {
                    reject(new Error(`Failed to parse Groq response: ${e.message}. Raw data: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.write(requestData);
        req.end();
    });
}

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    console.log('[HEALTH] GET /api/health - OK');
    res.json({ status: 'ok' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

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
    color: { type: String, default: '#667eea' }
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

// ChatBot - Note Summarization Endpoint
app.post('/api/summarize-notes', async (req, res) => {
    console.log('[REQUEST] Received POST /api/summarize-notes');
    console.log('[REQUEST BODY]', req.body);
    
    try {
        const { notes } = req.body;

        if (!notes || notes.trim() === '') {
            console.log('[VALIDATION] Notes empty');
            return res.status(400).json({ message: 'Notes content is required' });
        }

        // Check if Groq API key is configured
        if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
            console.log('[GROQ] Using Groq API with real key...');
            
            try {
                const summary = await callGroqAPI(notes);
                console.log('[SUCCESS] Summary generated by Groq:', summary.substring(0, 50) + '...');
                res.json({ summary });
                return;
            } catch (error) {
                console.error('[GROQ ERROR]', error.message);
                // Fall through to mock mode
            }
        }

        // MOCK MODE - generate a test summary
        console.log('[MOCK MODE] Generating mock summary (set GROQ_API_KEY in .env file for real AI)');
        
        // Extract first 100 characters for mock analysis
        const notesPreview = notes.substring(0, 100).toLowerCase();
        
        // Generate a contextual mock summary based on content
        let summary = `📚 **Summary of Your Notes**\n\n`;
        
        if (notesPreview.includes('react') || notesPreview.includes('javascript')) {
            summary += `**Key Concepts:**\n`;
            summary += `• React is a JavaScript library for building user interfaces with reusable components\n`;
            summary += `• Components can be functional or class-based\n`;
            summary += `• State management is crucial for dynamic applications\n`;
            summary += `• Props allow data to flow between components\n\n`;
            summary += `**Important Points:**\n`;
            summary += `• Always update state immutably\n`;
            summary += `• Use hooks (useState, useEffect) in functional components\n`;
            summary += `• Optimize performance with React.memo and useCallback\n\n`;
            summary += `**Study Tips:**\n`;
            summary += `• Practice building small projects to reinforce concepts\n`;
            summary += `• Review React documentation regularly\n`;
            summary += `• Join React communities for support and learning`;
        } else {
            summary += `**Key Concepts:**\n`;
            summary += `• Your notes contain important educational material\n`;
            summary += `• Focus on understanding core principles before diving into details\n`;
            summary += `• Create connections between related concepts\n\n`;
            summary += `**Important Points:**\n`;
            summary += `• Review the material multiple times for retention\n`;
            summary += `• Practice with real-world examples\n`;
            summary += `• Test your understanding through exercises\n\n`;
            summary += `**Study Tips:**\n`;
            summary += `• Break down complex topics into smaller parts\n`;
            summary += `• Use active recall to strengthen memory\n`;
            summary += `• Teach the material to someone else for better understanding`;
        }

        console.log('[SUCCESS] Mock summary generated');
        console.log('[INFO] To use real AI summaries, set GROQ_API_KEY in your .env file');
        res.json({ summary });
    } catch (error) {
        console.error('[ERROR]', error.message);
        res.status(500).json({ message: 'Failed to summarize notes', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
