'use client';
import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from '../chatbot/components/ChatHeader';
import ChatMessage from '../chatbot/components/ChatMessage';
import FAQSection from '../chatbot/components/FAQSection';
import { generateResponse } from '../../services/chatbot/chatServiceDev';
import { Dropdown } from 'primereact/dropdown';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp?: string;
  originalPrompt?: string;
  userMessageId?: string;
}

export interface UserInfo {
  user_id: string;
  session_id: string;
}

const ChatbotInterfaceDev: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [visible, setVisible] = useState<boolean>(true);
  const [message, setMessage] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any>('');
  const [userInfoLoading, setUserInfoLoading] = useState<boolean>(true);
  const [airesponse, setAiResponse] = useState<any>('');

  const cities = [
    { name: 'Professional', code: 'PRF' },
    { name: 'Casual', code: 'CSL' },
    { name: 'Technical', code: 'TECH' },
    { name: 'Concise', code: 'CON' },
    { name: 'Normal', code: 'NOR' },
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setUserInfoLoading(true);
        const response = await fetch(
          "/sap/opu/odata/sap/ZSCM_CT_CONFIG_SRV/LogUserSet('')?$format=json",
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`SAP API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.d && data.d.UserName) {
          const user_id = data.d.UserName;
          const session_id = Math.random().toString(36).substring(2, 7);

          setUserInfo({
            user_id,
            session_id,
          });
        } else {
          console.warn('Unexpected SAP API response format or missing UserName:', data);
          setUserInfo({
            user_id: `user_${Date.now()}`,
            session_id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          });
        }
      } catch (error) {
        console.error('Error fetching user info from SAP:', error);
        setUserInfo({
          user_id: `user_${Date.now()}`,
          session_id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        });
      } finally {
        setUserInfoLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleSendMessage = async (message: string, visible: boolean) => {
    if (!userInfo) {
      console.warn('User info not loaded yet');
      return;
    }

    setMessage('');
    setVisible(visible);

    const userMessageId = generateMessageId();

    const userMessage: Message = {
      id: userMessageId,
      content: message,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const botMessageId = generateMessageId();

      const botMessage: Message = {
        id: botMessageId,
        content: '',
        isUser: false,
        timestamp: new Date().toISOString(),
        originalPrompt: message,
        userMessageId: userMessageId,
      };
      setMessages((prev) => [...prev, botMessage]);

      let accumulated = '';
      const response = await generateResponse(message, userInfo, (chunk) => {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === botMessageId ? { ...m, content: accumulated } : m))
        );
      });

      setAiResponse(response);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMessageId
            ? { ...m, content: response.content, timestamp: response.metadata?.timestamp }
            : m
        )
      );
    } catch (error) {
      console.error('Error generating response (DEV):', error);

      const errorMessage: Message = {
        id: generateMessageId(),
        content: 'Sorry, I encountered an error processing your request.',
        isUser: false,
        originalPrompt: message,
        userMessageId: userMessageId,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateResponse = async (messageId: string, originalPrompt: string) => {
    if (!userInfo) {
      console.warn('User info not loaded yet');
      return;
    }

    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setLoading(true);

    try {
      const response = await generateResponse(originalPrompt, userInfo);

      const userMessage = messages.find((msg) => msg.content === originalPrompt && msg.isUser);

      const newBotMessage: Message = {
        id: generateMessageId(),
        content: response.content,
        isUser: false,
        timestamp: response.metadata?.timestamp,
        originalPrompt: originalPrompt,
        userMessageId: userMessage?.id,
      };

      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      console.error('Error regenerating response (DEV):', error);

      const errorMessage: Message = {
        id: generateMessageId(),
        content: 'Sorry, I encountered an error regenerating the response.',
        isUser: false,
        originalPrompt: originalPrompt,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (question: string, visible: boolean) => {
    handleSendMessage(question, visible);
  };

  const ChatbotTyping = () => {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="h-3 w-3 animate-bounce rounded-full bg-gray-400 [animation-delay:0s]"></div>
        <div className="h-3 w-3 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]"></div>
        <div className="h-3 w-3 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]"></div>
        <span className="ml-2 text-sm text-gray-500">...</span>
      </div>
    );
  };

  if (userInfoLoading) {
    return (
      <div className="relative flex max-h-[80vh] min-h-screen w-full flex-col items-center justify-center overflow-auto bg-[url('../../public/chatbot/bg.jpg')] bg-cover bg-center p-1 md:p-8">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-bounce rounded-full bg-blue-500 [animation-delay:0s]"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-blue-500 [animation-delay:0.2s]"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-blue-500 [animation-delay:0.4s]"></div>
          <span className="ml-2 text-lg text-gray-600">...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex max-h-[80vh] min-h-screen w-full flex-col items-center justify-between overflow-auto bg-[url('../../public/chatbot/bg.jpg')] bg-cover bg-center p-1 md:p-8">
      <div className="flex w-full max-w-5xl flex-grow flex-col overflow-hidden">
        {visible && <ChatHeader />}
        <div className="mb-6 flex-grow overflow-y-auto px-2 md:px-4">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  id={msg.id}
                  content={msg.content}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                  userInfo={userInfo}
                  airesponse={airesponse}
                  originalPrompt={msg.originalPrompt}
                  onRegenerate={!msg.isUser ? handleRegenerateResponse : undefined}
                />
              ))}
              {loading && messages[messages.length - 1]?.isUser && <ChatbotTyping />}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            ''
          )}
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col justify-between rounded-3xl border border-[#83BD01] bg-white px-6 pt-4 pb-3 shadow-lg">
        <div className="w-full">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(message, false);
                setMessage('');
              }
            }}
            placeholder="What do you want to know?"
            disabled={!userInfo}
            className="min-h-[60px] w-full resize-none rounded-md bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleSendMessage(message, false);
                setMessage('');
              }}
              disabled={!userInfo || loading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="50" height="50" rx="25" fill="#ECECEC" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.8396 14.8613C14.6779 14.7934 14.4996 14.7756 14.3277 14.8102C14.1558 14.8448 13.9983 14.9303 13.8755 15.0556C13.7528 15.1808 13.6705 15.34 13.6394 15.5126C13.6083 15.6852 13.6297 15.8631 13.7009 16.0233L17.3094 24.1258H26.1667C26.3988 24.1258 26.6214 24.218 26.7855 24.3821C26.9495 24.5462 27.0417 24.7688 27.0417 25.0008C27.0417 25.2329 26.9495 25.4555 26.7855 25.6196C26.6214 25.7837 26.3988 25.8758 26.1667 25.8758H17.3094L13.7009 33.9783C13.6297 34.1386 13.6083 34.3165 13.6394 34.4891C13.6705 34.6617 13.7528 34.8209 13.8755 34.9461C13.9983 35.0714 14.1558 35.1568 14.3277 35.1915C14.4996 35.2261 14.6779 35.2083 14.8396 35.1403L37.0062 25.807C37.1648 25.7401 37.3001 25.628 37.3952 25.4846C37.4903 25.3412 37.5411 25.1729 37.5411 25.0008C37.5411 24.8288 37.4903 24.6605 37.3952 24.5171C37.3001 24.3737 37.1648 24.2616 37.0062 24.1947L14.8396 14.8613Z"
                  fill="#00A3E0"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {visible && (
        <div className="w-full max-w-5xl">
          <FAQSection onSelectQuestion={handleSelectQuestion} />
        </div>
      )}
    </div>
  );
};

export default ChatbotInterfaceDev;


