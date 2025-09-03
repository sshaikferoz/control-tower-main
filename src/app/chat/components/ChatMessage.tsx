import React from 'react';
import { Check, RotateCw, Copy, Clock } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, isUser, timestamp }) => {
  const formattedTimeStamp = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp || ''));

  if (isUser) {
    return (
      <div className="mb-4 flex justify-end">
        <div className="box-border flex h-[74px] w-[1130px] max-w-[80%] flex-row items-center gap-6 rounded-[24px] border border-[#83BD01] bg-[linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.1)),rgba(13,54,111,0.7)] p-6 text-white shadow-md">
          <p>{content}</p>
        </div>
      </div>
    );
  }

  // For bot responses, we may need to parse and format the content as HTML
  return (
    <div className="mb-8 flex flex-col justify-start">
      <div className="answer-card animate-fade-in isolate flex max-h-screen w-[1130px] max-w-[100%] flex-col items-start gap-[10px] rounded-[24px] bg-[#384F73] p-6 shadow-[0px_9px_4.4px_rgba(0,0,0,0.16)]">
        <div className="max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-3 text-white">
        <span>{formattedTimeStamp}</span>
        <button className="rounded-full p-1 hover:bg-gray-700" title="Refresh">
          <RotateCw size={18} />
        </button>
        <button className="rounded-full p-1 hover:bg-gray-700" title="Copy">
          <Copy size={18} />
        </button>
        <button className="flex rounded-full p-1 hover:bg-gray-700" title="History">
          <Clock size={18} />
        </button>
        <button className="rounded-full bg-green-600 p-1 hover:bg-green-700" title="Good response">
          <Check size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatMessage;
