import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCw, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import FeedbackDialog from './FeedbackDialog';
import {
    submitNegativeFeedback,
    submitPositiveFeedback,
    UserInfo,
} from '@/services/chatbot-v2/chatService';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
    id: string;
    content: string;
    isUser: boolean;
    timestamp?: string;
    userInfo: UserInfo;
    airesponse: any;
    onRegenerate?: (messageId: string, originalPrompt: string) => void;
    originalPrompt?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    id,
    content,
    isUser,
    timestamp,
    userInfo,
    onRegenerate,
    airesponse,
    originalPrompt,
}) => {
    const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [isLiked, setIsLiked] = useState<boolean | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const formattedTimeStamp = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(timestamp || ''));

    useEffect(() => {
        if (contentRef.current && !isUser) {
            const links = contentRef.current.querySelectorAll('a');
            links.forEach((link) => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });
        }
    }, [content, isUser]);

    const handleLike = async () => {
        setIsLiked(true);
        setFeedbackSubmitted(true);
        try {
            const response = await submitPositiveFeedback(id, userInfo, airesponse, originalPrompt);
            //   console.log(response.message);
        } catch (error) {
            console.error('Failed to submit positive feedback:', error);
        }
    };

    const handleDislike = () => {
        setIsLiked(false);
        setShowFeedbackDialog(true);
    };

    const handleFeedbackSubmit = async (rating: number, comments: string) => {
        setFeedbackSubmitted(true);
        setShowFeedbackDialog(false);
        try {
            const response = await submitNegativeFeedback(
                id,
                userInfo,
                airesponse,
                originalPrompt,
                comments
            );
            //   console.log(response.message);
        } catch (error) {
            console.error('Failed to submit negative feedback:', error);
        }
    };

    const handleRegenerate = () => {
        if (onRegenerate && originalPrompt) {
            onRegenerate(id, originalPrompt);
        }
    };

    const handleCopy = () => {
        navigator.clipboard
            .writeText(content.replace(/<[^>]+>/g, ''))
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch((err) => console.error('Copy failed:', err));
    };

    if (isUser) {
        return (
            <div className="mb-4 flex justify-end">
                <div className="box-border flex w-[70%] flex-row items-start gap-4 rounded-[24px] border border-[#83BD01] bg-[linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1)),rgba(13,54,111,0.7)] p-6 text-white shadow-md">
                    <div className="min-w-0">
                        <p className="leading-relaxed break-words whitespace-pre-wrap">{content}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
        .chat-response-content {
          color: #ffffff;
          line-height: 1.6;
        }

        .chat-response-content p {
          margin: 0 0 16px 0;
        }

        .chat-response-content h1,
        .chat-response-content h2,
        .chat-response-content h3,
        .chat-response-content h4 {
          color: #83bd01;
          font-weight: 600;
          margin: 20px 0 12px 0;
          line-height: 1.4;
        }

        .chat-response-content h1 {
          font-size: 1.875rem;
          border-bottom: 2px solid #83bd01;
          padding-bottom: 8px;
        }
        .chat-response-content h2 {
          font-size: 1.5rem;
        }
        .chat-response-content h3 {
          font-size: 1.25rem;
        }
        .chat-response-content h4 {
          font-size: 1.125rem;
        }

        .chat-response-content ul,
        .chat-response-content ol {
          margin: 16px 0;
          padding-left: 20px;
        }

        .chat-response-content ul li {
          margin: 8px 0;
          list-style: disc;
        }

        .chat-response-content ol li {
          margin: 8px 0;
          list-style: decimal;
        }

        /* 🔹 Hyperlink Styling */
        .chat-response-content a,
        .chat-response-content a:link,
        .chat-response-content a:visited {
          color: #4db8ff !important;
          text-decoration: underline !important;
          font-weight: 600;
        }
        .chat-response-content a:hover {
          color: #66d9ff !important;
          background-color: rgba(77, 184, 255, 0.15);
          padding: 2px 4px;
          border-radius: 4px;
        }

        .chat-response-content strong {
          color: #83bd01;
          font-weight: 600;
        }

        .chat-response-content code {
          background: rgba(255, 255, 255, 0.1);
          color: #83bd01;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }

        .chat-response-content pre {
          background: rgba(0, 0, 0, 0.3);
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
          border-left: 4px solid #83bd01;
          overflow-x: auto;
        }

        .chat-response-content blockquote {
          border-left: 4px solid #83bd01;
          padding-left: 16px;
          margin: 16px 0;
          color: #e0e0e0;
          font-style: italic;
        }

        .chat-response-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .chat-response-content th {
          background: #83bd01;
          color: #000;
          padding: 8px;
        }
        .chat-response-content td {
          padding: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .chat-response-content img {
          max-width: 100%;
          border-radius: 8px;
          margin: 12px 0;
        }
      `}</style>

            <div className="mb-8 flex flex-col justify-start">
                <div className="answer-card animate-fade-in isolate flex w-full max-w-[1130px] flex-col items-start gap-[10px] rounded-[24px] bg-[#384F73] p-6 shadow-md">
                    <div ref={contentRef} className="chat-response-content w-full max-w-none">
                        <MarkdownRenderer markdown={content} />
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <span className="ml-4 text-sm text-white">{formattedTimeStamp}</span>

                    <div className="flex gap-2">
                        {!feedbackSubmitted ? (
                            <>
                                <button
                                    className={`rounded-full p-2 ${isLiked === true ? 'bg-gray-700 text-white' : 'text-white hover:bg-gray-700'}`}
                                    onClick={handleLike}
                                    title="Good response"
                                >
                                    <ThumbsUp size={16} />
                                </button>
                                <button
                                    className={`rounded-full p-2 ${isLiked === false ? 'bg-red-400 text-white' : 'text-white hover:bg-gray-700'}`}
                                    onClick={handleDislike}
                                    title="Poor response"
                                >
                                    <ThumbsDown size={16} />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-[#83BD01]">
                                <Check size={16} />
                                <span>Feedback submitted</span>
                            </div>
                        )}

                        <div className="mx-2 h-6 w-px bg-gray-300"></div>

                        <button
                            className="rounded-full p-2 text-white hover:bg-gray-700"
                            onClick={handleRegenerate}
                            title="Regenerate response"
                            disabled={!onRegenerate || !originalPrompt}
                        >
                            <RotateCw size={16} />
                        </button>

                        {isCopied ? (
                            <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#83BD01]">
                                <Check size={16} />
                                <span>Copied</span>
                            </div>
                        ) : (
                            <button
                                className="rounded-full p-2 text-white hover:bg-gray-700"
                                onClick={handleCopy}
                                title="Copy to clipboard"
                            >
                                <Copy size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <FeedbackDialog
                isOpen={showFeedbackDialog}
                onClose={() => setShowFeedbackDialog(false)}
                onSubmit={handleFeedbackSubmit}
            />
        </>
    );
};

export default ChatMessage;
