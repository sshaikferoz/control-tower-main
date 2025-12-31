'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { sapODataService } from '@/services/sapODataService';

type ChatbotVariant = 'v1' | 'v2';

interface ChatbotConfig {
    variant: ChatbotVariant;
}

const DEFAULT_VARIANT: ChatbotVariant = 'v2';

// Dynamic imports for each chatbot version
const ChatbotV1 = dynamic(() => import('../chatbot-v1/page'), {
    loading: () => <LoadingSpinner />,
});

const ChatbotV2 = dynamic(() => import('../chatbot-v2/page'), {
    loading: () => <LoadingSpinner />,
});

const LoadingSpinner: React.FC = () => (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-gray-100">
        <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-bounce rounded-full bg-blue-500 [animation-delay:0s]"></div>
            <div className="h-4 w-4 animate-bounce rounded-full bg-blue-500 [animation-delay:0.2s]"></div>
            <div className="h-4 w-4 animate-bounce rounded-full bg-blue-500 [animation-delay:0.4s]"></div>
            <span className="ml-2 text-lg text-gray-600">Loading chatbot...</span>
        </div>
    </div>
);

const ChatbotPage: React.FC = () => {
    const [variant, setVariant] = useState<ChatbotVariant | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const remoteConfig = await sapODataService.fetchUIConfig('chatbot');

                // Check for variant field
                if (remoteConfig?.variant === 'v1' || remoteConfig?.variant === 'v2') {
                    setVariant(remoteConfig.variant as ChatbotVariant);
                    return;
                }

                // Backward compatibility for older configs that used version field
                if (remoteConfig?.version === 'non-streaming') {
                    setVariant('v1');
                    return;
                }

                // Default to v2
                setVariant(DEFAULT_VARIANT);
            } catch (error) {
                console.error('Failed to load chatbot configuration:', error);
                setVariant(DEFAULT_VARIANT);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    if (loading || variant === null) {
        return <LoadingSpinner />;
    }

    // Render the appropriate chatbot version
    return variant === 'v1' ? <ChatbotV1 /> : <ChatbotV2 />;
};

export default ChatbotPage;







