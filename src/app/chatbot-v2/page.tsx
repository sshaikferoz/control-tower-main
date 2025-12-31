'use client';
import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './components/ChatHeader';
import ChatMessage from './components/ChatMessage';
import FAQSection from './components/FAQSection';
import { generateResponse } from '../../services/chatbot-v2/chatService';
import { Dropdown } from 'primereact/dropdown';

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp?: string;
    originalPrompt?: string; // For bot messages, store the original user prompt
    userMessageId?: string; // For bot messages, reference to the user message ID
}

export interface UserInfo {
    user_id: string;
    session_id: string;
}

const ChatbotInterface: React.FC = () => {
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
    const isStreamingRef = useRef<boolean>(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (smooth: boolean = false) => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
        }
    };

    // Throttled scroll for streaming updates
    const scrollToBottomThrottled = () => {
        if (scrollTimeoutRef.current) {
            return;
        }

        scrollTimeoutRef.current = setTimeout(() => {
            scrollToBottom(false); // Use instant scroll during streaming
            scrollTimeoutRef.current = null;
        }, 50); // Throttle to ~20fps
    };

    useEffect(() => {
        // Use smooth scroll only when not streaming (new message added)
        // Use instant scroll during streaming to prevent flickering
        if (isStreamingRef.current) {
            scrollToBottomThrottled();
        } else {
            scrollToBottom(true);
        }
    }, [messages]);

    // Generate unique ID for messages
    const generateMessageId = () => {
        return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    };

    // Fetch user information from SAP endpoint on component mount
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

                    //   console.log('User info retrieved from SAP:', { user_id, session_id });

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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    const handleSendMessage = async (message: string, visible: boolean) => {
        if (!userInfo) {
            console.warn('User info not loaded yet');
            return;
        }

        setMessage('');
        setVisible(visible);

        const userMessageId = generateMessageId();

        // Add user message
        const userMessage: Message = {
            id: userMessageId,
            content: message,
            isUser: true,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            // Get response from service with user info
            const botMessageId = generateMessageId();

            // Add empty placeholder for bot response
            const botMessage: Message = {
                id: botMessageId,
                content: '',
                isUser: false,
                timestamp: new Date().toISOString(),
                originalPrompt: message,
                userMessageId: userMessageId,
            };
            setMessages((prev) => [...prev, botMessage]);

            // Stream chunks
            let accumulated = '';
            isStreamingRef.current = true;
            const response = await generateResponse(message, userInfo, (chunk) => {
                accumulated += chunk;

                // Update bot message progressively
                setMessages((prev) =>
                    prev.map((m) => (m.id === botMessageId ? { ...m, content: accumulated } : m))
                );
            });
            isStreamingRef.current = false;

            setAiResponse(response);

            // Final update with metadata timestamp
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === botMessageId
                        ? { ...m, content: response.content, timestamp: response.metadata?.timestamp }
                        : m
                )
            );
        } catch (error) {
            console.error('Error generating response:', error);
            isStreamingRef.current = false;

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

        // Find the message to regenerate and remove it from the list
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        setLoading(true);

        try {
            // Get new response from service
            const response = await generateResponse(originalPrompt, userInfo);

            // Find the corresponding user message ID
            const userMessage = messages.find((msg) => msg.content === originalPrompt && msg.isUser);

            // Add new bot response
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
            console.error('Error regenerating response:', error);

            // Add error message
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

    // Show loading state while fetching user info
    if (userInfoLoading) {
        return (
            <div className="relative flex max-h-[80vh] min-h-screen w-full flex-col items-center justify-center overflow-auto bg-gray-100 bg-[url('../../public/chatbot/bg.png')] bg-cover bg-center p-1 md:p-8">
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
        <div className="relative flex max-h-[80vh] min-h-screen w-full flex-col items-center justify-between overflow-auto bg-gray-100 bg-[url('../../public/chatbot/bg.png')] bg-cover bg-no-repeat bg-center p-1 md:p-8">
            <div className="flex w-full max-w-5xl flex-grow flex-col overflow-hidden">
                {visible && <ChatHeader />}
                <div
                    ref={messagesContainerRef}
                    className="mb-6 flex-grow overflow-y-auto px-2 md:px-4"
                    style={{ scrollBehavior: 'auto' }}
                >
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
            {/* <div className="absolute z-50 h-full w-full bg-[url('../../public/chatbot/smile.png')] bg-right bg-no-repeat"></div>
      <div className="relative z-10 w-full max-w-4xl scale-[1] rounded-3xl border border-[#83BD01] bg-white pt-4 pr-4 pb-1 pl-4 shadow-sm">
        <div className="relative flex max-h-52 flex-col">
          <div className="w-full">
            <textarea
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(message, false);
                }
              }}
              placeholder="What do you want to know?"
              className="relative min-h-14 w-full resize-none text-gray-800 placeholder-gray-400 focus:outline-none"
              disabled={!userInfo}
            />
          </div>
        </div>
        <div className="flex items-end justify-between text-sm text-gray-500">
          <span className="flex items-center gap-1 self-center">
            <span className="font-sans text-sm font-thin">Powered by Labeeb</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18C4.0293 18 0 13.9707 0 9C0 4.0293 4.0293 0 9 0C13.9707 0 18 4.0293 18 9C18 13.9707 13.9707 18 9 18ZM15.003 9C14.9937 8.74667 14.9114 8.50142 14.7659 8.29383C14.6204 8.08624 14.418 7.92517 14.183 7.83004C13.948 7.73491 13.6905 7.70978 13.4416 7.75768C13.1927 7.80558 12.9629 7.92446 12.78 8.1C11.7562 7.40404 10.5527 7.01955 9.315 6.993L9.9 4.185L11.826 4.59C11.8489 4.80283 11.9469 5.00054 12.1024 5.14762C12.258 5.29471 12.4608 5.38155 12.6746 5.39255C12.8884 5.40355 13.0991 5.33799 13.2689 5.20764C13.4387 5.07729 13.5565 4.89069 13.6011 4.68133C13.6457 4.47197 13.6142 4.25356 13.5123 4.0653C13.4104 3.87705 13.2448 3.73128 13.0451 3.65417C12.8454 3.57705 12.6247 3.57363 12.4228 3.64453C12.2208 3.71543 12.0507 3.85599 11.943 4.041L9.738 3.6C9.70194 3.59209 9.66466 3.59141 9.62834 3.59801C9.59201 3.60461 9.55736 3.61836 9.52639 3.63845C9.49541 3.65854 9.46873 3.68458 9.4479 3.71506C9.42706 3.74554 9.41248 3.77985 9.405 3.816L8.739 6.939C7.48609 6.95789 6.26604 7.34267 5.229 8.046C5.09026 7.91546 4.92479 7.81664 4.74406 7.75641C4.56333 7.69617 4.37167 7.67595 4.18235 7.69715C3.99303 7.71835 3.81058 7.78046 3.64766 7.87918C3.48473 7.9779 3.34521 8.11086 3.23878 8.26886C3.13235 8.42686 3.06154 8.60611 3.03127 8.79419C3.001 8.98227 3.01198 9.17468 3.06347 9.3581C3.11495 9.54151 3.2057 9.71154 3.32942 9.85639C3.45315 10.0012 3.60689 10.1175 3.78 10.197C3.76987 10.3288 3.76987 10.4612 3.78 10.593C3.78 12.609 6.129 14.247 9.027 14.247C11.925 14.247 14.274 12.609 14.274 10.593C14.2841 10.4612 14.2841 10.3288 14.274 10.197C14.4961 10.0866 14.6824 9.91563 14.8114 9.70381C14.9404 9.49199 15.0068 9.24798 15.003 9ZM6.003 9.9C6.003 9.6613 6.09782 9.43239 6.2666 9.2636C6.43539 9.09482 6.66431 9 6.903 9C7.14169 9 7.37061 9.09482 7.5394 9.2636C7.70818 9.43239 7.803 9.6613 7.803 9.9C7.803 10.1387 7.70818 10.3676 7.5394 10.5364C7.37061 10.7052 7.14169 10.8 6.903 10.8C6.66431 10.8 6.43539 10.7052 6.2666 10.5364C6.09782 10.3676 6.003 10.1387 6.003 9.9ZM11.232 12.375C10.5935 12.8562 9.80785 13.1011 9.009 13.068C8.21015 13.1011 7.42453 12.8562 6.786 12.375C6.74773 12.3284 6.72817 12.2692 6.73113 12.2089C6.73409 12.1487 6.75935 12.0917 6.80201 12.049C6.84467 12.0064 6.90166 11.9811 6.96192 11.9781C7.02217 11.9752 7.08137 11.9947 7.128 12.033C7.66911 12.4299 8.32961 12.63 9 12.6C9.67122 12.6365 10.3348 12.4428 10.881 12.051C10.904 12.0252 10.9321 12.0044 10.9635 11.99C10.9949 11.9755 11.0289 11.9677 11.0634 11.9669C11.098 11.9661 11.1323 11.9725 11.1643 11.9856C11.1963 11.9986 11.2253 12.0182 11.2494 12.0429C11.2735 12.0677 11.2923 12.0971 11.3046 12.1294C11.3168 12.1617 11.3223 12.1962 11.3207 12.2307C11.3191 12.2653 11.3103 12.2991 11.2951 12.3301C11.2798 12.3611 11.2584 12.3886 11.232 12.411V12.375ZM11.07 10.836C10.892 10.836 10.718 10.7832 10.57 10.6843C10.422 10.5854 10.3066 10.4449 10.2385 10.2804C10.1704 10.116 10.1526 9.935 10.1873 9.76042C10.222 9.58584 10.3077 9.42547 10.4336 9.2996C10.5595 9.17374 10.7198 9.08802 10.8944 9.05329C11.069 9.01857 11.25 9.03639 11.4144 9.10451C11.5789 9.17263 11.7194 9.28798 11.8183 9.43599C11.9172 9.58399 11.97 9.758 11.97 9.936C11.9749 10.0579 11.9549 10.1796 11.9113 10.2936C11.8677 10.4076 11.8014 10.5115 11.7164 10.5991C11.6313 10.6866 11.5294 10.756 11.4167 10.8029C11.3041 10.8498 11.183 10.8733 11.061 10.872L11.07 10.836Z"
                fill="#5F6C81"
              />
            </svg>
          </span>
          <div className="flex items-center">
            <button
              className="ml-2 text-blue-500 hover:text-blue-600"
              onClick={() => {
                handleSendMessage(message, false);
              }}
              disabled={!userInfo || loading}
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
      </div> */}
            {/* {visible && (
        <div className="flex w-full max-w-5xl justify-end">
          <div
            className="aspect-[2/3] h-28 w-28 bg-contain bg-right bg-no-repeat"
            style={{
              backgroundImage: `url('${process.env.NEXT_PUBLIC_BSP_NAME}/chatbot/smile.png')`,
            }}
          />
        </div>
      )} */}

            {/* Input Box */}
            <div className="relative z-10 flex w-full max-w-5xl flex-col justify-between rounded-3xl border border-[#83BD01] bg-white px-6 pt-4 pb-3 shadow-lg">
                {/* Textarea */}
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

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                    {/* Powered by Labeeb */}
                    <div className="flex items-center gap-1"></div>

                    {/* Style dropdown + send button */}
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

export default ChatbotInterface;
