import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';
import SummaryFormatter from './SummaryFormatter';
import { summarizeNotes } from '../../utils/api';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker for pdfjs - use local file
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your study assistant. Share your course notes or upload documents (PDF, TXT, DOCX), and I'll help you summarize them. 📚",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract text from PDF file
  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Ensure worker is properly configured
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          if (!textContent || !textContent.items) {
            console.warn(`Page ${pageNum} has no text content`);
            continue;
          }
          
          const pageText = textContent.items
            .map((item) => {
              if (typeof item === 'string') return item;
              return item.str || '';
            })
            .join(' ');
          
          fullText += pageText + '\n';
        } catch (pageError) {
          console.warn(`Error extracting page ${pageNum}:`, pageError);
          continue;
        }
      }
      
      if (!fullText.trim()) {
        throw new Error('No text content found in PDF');
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting PDF:', error);
      throw new Error(`Failed to read PDF file: ${error.message}`);
    }
  };

  // Extract text from text file
  const extractTextFromTXT = async (file) => {
    try {
      const text = await file.text();
      return text;
    } catch (error) {
      console.error('Error extracting TXT:', error);
      throw new Error('Failed to read text file');
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name;
    const fileType = file.type;
    const extension = fileName.split('.').pop().toLowerCase();

    try {
      setIsLoading(true);
      let extractedText = '';

      // Handle different file types
      if (extension === 'pdf' || fileType === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (extension === 'txt' || fileType === 'text/plain') {
        extractedText = await extractTextFromTXT(file);
      } else if (extension === 'docx') {
        // For DOCX, we'll use a simple approach (in production, use mammoth.js)
        throw new Error('DOCX support coming soon. Please convert to PDF or TXT.');
      } else {
        throw new Error(`Unsupported file type: ${extension}`);
      }

      if (extractedText.trim().length === 0) {
        throw new Error('No text content found in file');
      }

      // Set the uploaded file info
      setUploadedFile({
        name: fileName,
        size: file.size,
        content: extractedText,
      });

      // Add file upload message
      const fileMessage = {
        id: messages.length + 1,
        text: `📄 File uploaded: ${fileName} (${(file.size / 1024).toFixed(2)} KB)`,
        sender: 'user',
        timestamp: new Date(),
        isFile: true,
      };

      setMessages((prev) => [...prev, fileMessage]);
      
      // Auto-send for summarization
      const successMessage = {
        id: messages.length + 2,
        text: 'File loaded! Click Send to get a summary.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error) {
      console.error('Error handling file:', error);
      const errorMessage = {
        id: messages.length + 1,
        text: `❌ Error: ${error.message}`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = async () => {
    const contentToSend = uploadedFile?.content || userInput;
    
    if (!contentToSend.trim()) return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: uploadedFile ? `Summarize: ${uploadedFile.name}` : userInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Call backend API to summarize notes
      const response = await summarizeNotes(contentToSend);

      const botMessage = {
        id: messages.length + 2,
        text: response.summary || "I couldn't process that. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      
      // Clear uploaded file after sending
      if (uploadedFile) {
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Error summarizing notes:', error);

      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-widget">
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="chatbot-button"
          onClick={() => setIsOpen(true)}
          title="Open Study Assistant"
        >
          <span className="chatbot-icon">💬</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <span className="title-icon">🤖</span>
              <h3>Study Assistant</h3>
            </div>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  {message.sender === 'bot' && message.text.includes('**') ? (
                    <SummaryFormatter text={message.text} />
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-content">
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-controls">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.txt,.docx,.doc"
                className="file-input"
                disabled={isLoading}
              />
              <button
                className="file-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload document (PDF, TXT, DOCX)"
                disabled={isLoading}
              >
                +
              </button>
              {uploadedFile && (
                <span className="file-indicator" title={uploadedFile.name}>
                  ✓ {uploadedFile.name}
                </span>
              )}
            </div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={uploadedFile ? "Or paste additional notes..." : "Paste your notes or ask a question..."}
              disabled={isLoading}
              rows="3"
              className="chatbot-textarea"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || (!userInput.trim() && !uploadedFile)}
              className="send-button"
            >
              {isLoading ? 'Processing...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
