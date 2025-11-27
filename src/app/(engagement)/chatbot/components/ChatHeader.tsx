import Image from 'next/image';

const ChatHeader = () => {
    return (
        <div className="py-8">
            <div className="flex items-center justify-center">
                <Image
                    src="/chatbot/chat-icon.png"
                    alt="SCAI AI Assistant logo"
                    width={90}
                    height={90}
                    priority
                    className="h-32 w-32 object-contain"
                />
            </div>

            <h1 className="text-5xl font-bold text-[#84cc16]">Supply Chain Analytics and Insights</h1>
            <h1 className="mt-4 text-2xl font-bold text-white">AI Assistant</h1>
        </div>
    );
};

export default ChatHeader;
