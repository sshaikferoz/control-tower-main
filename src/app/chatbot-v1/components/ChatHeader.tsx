'use client';

import { useTheme } from '@/contexts/ThemeContext';

const ChatHeader = () => {
    const { theme } = useTheme();

    return (
        <div className="py-8">
            <h1 className="text-5xl font-bold text-[#84cc16]">Supply Chain Analytics and Insights</h1>
            <h1
                className="mt-4 text-2xl font-bold"
                style={{ color: theme === 'light' ? '#293366' : '#ededed' }}
            >
                AI Assistant
            </h1>
        </div>
    );
};

export default ChatHeader;