# ChatBot Integration Guide

This LMS now includes a floating ChatBot widget that helps students summarize their course notes using Google Gemini AI.

## Features

✨ **Floating Chat Widget** - Minimalist chat interface in the bottom-right corner
📚 **Note Summarization** - Summarizes course materials and student notes
🤖 **AI-Powered** - Uses Google Gemini Pro for intelligent summarization
💬 **Conversational** - Simple, intuitive chat interface

## Setup Instructions

### 1. Get Google API Key

The chatbot uses Google's Generative AI API. Here's how to set it up:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key (it will be generated automatically)
4. Copy the API key

### 2. Configure Backend

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file and add your Google API key:
   ```
   MONGODB_URI=mongodb://localhost:27017/lms
   PORT=5000
   GOOGLE_API_KEY=your_api_key_here
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

### 3. Start Frontend

In another terminal, navigate to the Frontend directory:

```bash
cd Frontend
npm install  # if not already done
npm start
```

## How It Works

### User Workflow

1. **Open ChatBot** - Click the floating 💬 button in the bottom-right corner
2. **Paste Notes** - Paste course notes, lecture materials, or any text content
3. **Get Summary** - Click "Send" to get an AI-generated summary
4. **Review** - The bot provides key concepts, definitions, and study tips

### API Flow

```
Frontend (React)
    ↓
    POST /api/summarize-notes
    ↓
Backend (Express)
    ↓
    Google Gemini AI API
    ↓
Returns summarized content
    ↓
Displays in chat interface
```

## Files Added

### Frontend
- `src/components/ChatBot/ChatBot.js` - Main chatbot component
- `src/components/ChatBot/ChatBot.css` - Styling for the chatbot widget
- Updated `src/utils/api.js` - Added `summarizeNotes()` function

### Backend
- Updated `index.js` - Added `/api/summarize-notes` endpoint
- Updated `package.json` - Added `@google/generative-ai` dependency

## API Endpoint

### POST `/api/summarize-notes`

**Request:**
```json
{
  "notes": "Your course notes or lecture material here..."
}
```

**Response:**
```json
{
  "summary": "Comprehensive summary of the notes with key points, concepts, and study tips..."
}
```

## Customization

### Modify Summarization Prompt

Edit the prompt in `backend/index.js` (line ~107) to change how notes are summarized:

```javascript
const prompt = `You are an expert educational tutor. Please provide...`;
```

### Change UI Colors

Edit `src/components/ChatBot/ChatBot.css` to modify:
- Gradient colors (search for `#667eea` and `#764ba2`)
- Button size and spacing
- Chat window dimensions

### Adjust Chat Window Size

In `ChatBot.css`, modify:
```css
.chatbot-window {
  width: 400px;  /* Change width */
  max-height: 600px;  /* Change height */
}
```

## Troubleshooting

### "API key not configured"
- Make sure you've added `GOOGLE_API_KEY` to your `.env` file
- Restart the backend server after changing `.env`

### "Failed to summarize notes"
- Check your internet connection
- Verify the API key is valid
- Check backend console for detailed error messages

### ChatBot button not appearing
- Make sure `ChatBot` component is imported in `App.js`
- Check browser console for any errors
- Verify CSS file is properly imported

## Free Tier Limits

Google's Generative AI offers free usage with fair limits:
- 60 requests per minute
- Up to 4,000 RPM (Requests Per Month)

This should be sufficient for a typical student LMS usage.

## Future Enhancements

Potential features to add:
- Save conversation history
- Support for PDF uploads
- Multiple language support
- Q&A mode (ask questions about notes)
- Generate practice questions
- Export summaries as PDF

## Support for Issues

If you encounter issues:
1. Check the browser console for errors
2. Check the backend terminal for server errors
3. Verify all environment variables are set correctly
4. Ensure both frontend and backend servers are running
