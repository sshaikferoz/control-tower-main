'use client';
import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import FAQSection from './components/FAQSection';
import { generateResponse } from '../../services/chat/chatService';
import { Dropdown } from 'primereact/dropdown';
import ChatbotInterface from '../chatbot/page';

interface Message {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

interface ChatbotDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotDialog: React.FC<ChatbotDialogProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [visible, setVisible] = useState<boolean>(true);
  const [message, setMessage] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  const style = [
    { name: 'Professional', code: 'PRF' },
    { name: 'Casual', code: 'CSL' },
    { name: 'Technical', code: 'TECH' },
    { name: 'Concise', code: 'CON' },
    { name: 'Normal', code: 'NOR' },
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleSendMessage = async (message: string, visible: boolean) => {
    setMessage('');
    setVisible(visible);

    // Add user message
    const userMessage: Message = {
      content: message,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Get response from service
      const response = await generateResponse(message);

      // Add bot response
      const botMessage: Message = {
        content: response.content,
        isUser: false,
        timestamp: response.metadata?.timestamp,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);

      // Add error message
      const errorMessage: Message = {
        content: 'Sorry, I encountered an error processing your request.',
        isUser: false,
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSelectQuestion = (question: string, visible: boolean) => {
    handleSendMessage(question, visible);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#00214E] to-[#0164B0]/20 p-4">
      <div
        ref={dialogRef}
        className="animate-in fade-in-0 zoom-in-85 relative h-[100vh] w-full max-w-[70%] scale-90 overflow-auto rounded-[28px] bg-white shadow-2xl duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-1 right-4 z-10 rounded-full p-2 transition-colors duration-200 hover:bg-gray-200"
          aria-label="Close chat"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <ChatbotInterface></ChatbotInterface>
      </div>
    </div>
  );
};

export default ChatbotDialog;
