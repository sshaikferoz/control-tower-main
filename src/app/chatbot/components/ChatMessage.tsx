import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCw, Copy, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import FeedbackDialog from './FeedbackDialog';

interface ChatMessageProps {
  id: string;
  content: string;
  isUser: boolean;
  timestamp?: string;
  onRegenerate?: (messageId: string, originalPrompt: string) => void;
  originalPrompt?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  content,
  isUser,
  timestamp,
  onRegenerate,
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

  // Process links to open in new tabs
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

    // Submit positive feedback to API
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: id,
          feedback: 'positive',
          rating: 5,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log('Positive feedback submitted');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleDislike = () => {
    setIsLiked(false);
    setShowFeedbackDialog(true);
  };

  const handleFeedbackSubmit = async (rating: number, comments: string) => {
    setFeedbackSubmitted(true);
    setShowFeedbackDialog(false);

    // Submit negative feedback to API
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: id,
          feedback: 'negative',
          rating,
          comments,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log('Negative feedback submitted');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerate && originalPrompt) {
      onRegenerate(id, originalPrompt);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(
        content.replace(/<[^>]+>/g, '') // strips HTML tags for plain text
      )
      .then(() => {
        console.log('Copied to clipboard');
        setIsCopied(true);

        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.error('Copy failed:', err);
      });
  };

  if (isUser) {
    return (
      <div className="mb-4 flex justify-end">
        <div className="box-border flex h-[74px] w-[1130px] max-w-[80%] flex-row items-center gap-6 rounded-[24px] border border-[#83BD01] bg-[linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1)),rgba(13,54,111,0.7)] p-6 text-white shadow-md">
          <p>{content}</p>
        </div>
      </div>
    );
  }

  // For bot responses
  return (
    <>
      <style jsx>{`
        .chat-response-content {
          color: #ffffff;
          line-height: 1.6;
        }

        .chat-response-content p {
          margin: 0 0 16px 0;
          color: #ffffff;
        }

        .chat-response-content p:last-child {
          margin-bottom: 0;
        }

        .chat-response-content h1,
        .chat-response-content h2,
        .chat-response-content h3,
        .chat-response-content h4,
        .chat-response-content h5,
        .chat-response-content h6 {
          color: #83bd01;
          font-weight: 600;
          margin: 24px 0 16px 0;
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
          padding-left: 0;
          list-style: none;
        }

        .chat-response-content ul li,
        .chat-response-content ol li {
          position: relative;
          margin: 12px 0;
          padding-left: 24px;
          color: #ffffff;
          line-height: 1.6;
        }

        .chat-response-content ul li:before {
          content: '•';
          color: #83bd01;
          font-weight: bold;
          position: absolute;
          left: 0;
          top: 0;
          font-size: 1.2em;
        }

        .chat-response-content ol {
          counter-reset: list-counter;
        }

        .chat-response-content ol li {
          counter-increment: list-counter;
        }

        .chat-response-content ol li:before {
          content: counter(list-counter) '.';
          color: #83bd01;
          font-weight: bold;
          position: absolute;
          left: 0;
          top: 0;
        }

        .chat-response-content a {
          color: #83bd01;
          text-decoration: underline;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .chat-response-content a:hover {
          color: #a4d317;
          text-decoration: none;
          background-color: rgba(131, 189, 1, 0.1);
          padding: 2px 4px;
          border-radius: 4px;
        }

        .chat-response-content strong,
        .chat-response-content b {
          color: #83bd01;
          font-weight: 600;
        }

        .chat-response-content em,
        .chat-response-content i {
          color: #e0e0e0;
          font-style: italic;
        }

        .chat-response-content code {
          background-color: rgba(255, 255, 255, 0.1);
          color: #83bd01;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9em;
        }

        .chat-response-content pre {
          background-color: rgba(0, 0, 0, 0.3);
          color: #ffffff;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 16px 0;
          border-left: 4px solid #83bd01;
        }

        .chat-response-content pre code {
          background: none;
          padding: 0;
          color: inherit;
        }

        .chat-response-content blockquote {
          border-left: 4px solid #83bd01;
          padding-left: 16px;
          margin: 16px 0;
          color: #e0e0e0;
          font-style: italic;
          background-color: rgba(131, 189, 1, 0.05);
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
        }

        .chat-response-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .chat-response-content th {
          background-color: #83bd01;
          color: #000000;
          font-weight: 600;
          padding: 12px 16px;
          text-align: left;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }

        .chat-response-content td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .chat-response-content tr:nth-child(even) {
          background-color: rgba(255, 255, 255, 0.03);
        }

        .chat-response-content tr:hover {
          background-color: rgba(131, 189, 1, 0.1);
        }

        .chat-response-content hr {
          border: none;
          height: 2px;
          background: linear-gradient(to right, transparent, #83bd01, transparent);
          margin: 24px 0;
        }

        .chat-response-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .chat-response-content dl {
          margin: 16px 0;
        }

        .chat-response-content dt {
          color: #83bd01;
          font-weight: 600;
          margin-top: 16px;
          margin-bottom: 4px;
        }

        .chat-response-content dd {
          margin-left: 16px;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .chat-response-content kbd {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          padding: 2px 6px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9em;
          color: #83bd01;
        }

        .chat-response-content mark {
          background-color: rgba(131, 189, 1, 0.3);
          color: #000000;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .chat-response-content small {
          font-size: 0.875em;
          color: #b0b0b0;
        }

        .chat-response-content sub,
        .chat-response-content sup {
          font-size: 0.75em;
          color: #83bd01;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .chat-response-content table {
            font-size: 0.875rem;
          }

          .chat-response-content th,
          .chat-response-content td {
            padding: 8px 12px;
          }

          .chat-response-content h1 {
            font-size: 1.5rem;
          }

          .chat-response-content h2 {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div className="mb-8 flex flex-col justify-start">
        <div className="answer-card animate-fade-in isolate flex max-h-screen w-[1130px] max-w-[100%] flex-col items-start gap-[10px] rounded-[24px] bg-[#384F73] p-6 shadow-[0px_9px_4.4px_rgba(0,0,0,0.16)]">
          <div
            ref={contentRef}
            className="chat-response-content prose prose-sm prose-invert w-full max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-3">
            <span className="ml-4 text-sm text-white">{formattedTimeStamp}</span>
          </div>

          <div className="flex gap-2">
            {/* Feedback buttons */}
            {!feedbackSubmitted ? (
              <div className="flex gap-2">
                <button
                  className={`rounded-full p-2 transition-colors ${
                    isLiked === true ? 'bg-gray-700 text-white' : 'text-white hover:bg-gray-700'
                  }`}
                  title="Good response"
                  onClick={handleLike}
                >
                  <ThumbsUp size={16} />
                </button>
                <button
                  className={`rounded-full p-2 transition-colors ${
                    isLiked === false ? 'bg-red-400 text-white' : 'text-white hover:bg-gray-700'
                  }`}
                  title="Poor response"
                  onClick={handleDislike}
                >
                  <ThumbsDown size={16} />
                </button>
              </div>
            ) : (
              <div className="text-[ flex items-center gap-2 text-sm text-[#83BD01]">
                <Check size={16} />
                <span>Feedback submitted</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="mx-2 h-6 w-px bg-gray-300"></div>

            <button
              className="rounded-full p-2 text-white transition-colors hover:bg-gray-700"
              title="Regenerate response"
              onClick={handleRegenerate}
              disabled={!onRegenerate || !originalPrompt}
            >
              <RotateCw size={16} />
            </button>

            {/* Copy button with feedback */}
            {isCopied ? (
              <div className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[#83BD01]">
                <Check size={16} />
                <span>Copied</span>
              </div>
            ) : (
              <button
                className="rounded-full p-2 text-white transition-colors hover:bg-gray-700"
                title="Copy to clipboard"
                onClick={handleCopy}
              >
                <Copy size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <FeedbackDialog
        isOpen={showFeedbackDialog}
        onClose={() => setShowFeedbackDialog(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
};

export default ChatMessage;
