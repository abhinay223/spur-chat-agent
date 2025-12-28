import React, { useState, useEffect } from 'react';
import type { Message } from '../types/chat.types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { chatAPI } from '../services/api'; // Using real API now


export const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Initialize session
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Load conversation history
      loadHistory(storedSessionId);
    }
  }, []);


  const loadHistory = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const data = await chatAPI.getConversation(sessionId);
      
      // Convert backend messages to frontend format
      const loadedMessages: Message[] = data.messages.map((msg: any) => ({
        id: msg.id,
        sender: msg.role === 'user' ? 'user' : 'ai',
        text: msg.content,
        createdAt: new Date(msg.createdAt),
      }));
      
      setMessages(loadedMessages);
    } catch (err) {
      console.error('Failed to load history:', err);
      // If conversation not found, start fresh
      localStorage.removeItem('chatSessionId');
      setSessionId(null);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSendMessage = async (messageText: string) => {
    if (isLoading) return;

    setError(null);
    
    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageText,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call real backend API
      const response = await chatAPI.sendMessage(messageText, sessionId || undefined);

      // Save session ID from backend
      if (!sessionId) {
        setSessionId(response.conversationId);
        localStorage.setItem('chatSessionId', response.conversationId);
      }

      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.response,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: '❌ Sorry, I encountered an error. Please try again.',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem('chatSessionId');
    setError(null);
  };


  return (
    <div className="flex flex-col h-full bg-gray-50">

      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">TechStore Support</h1>
            <p className="text-sm opacity-90">AI-powered assistance</p>
          </div>
          <button
            onClick={handleNewChat}
            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} isTyping={isLoading} />

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};
