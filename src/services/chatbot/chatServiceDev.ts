export interface ChatbotResponse {
    content: string;
    metadata?: {
        type?: string;
        timestamp?: string;
    };
}

export interface UserInfo {
    user_id: string;
    session_id: string;
}

interface FeedbackResponse {
    code: string;
    data: { message_id: string };
    message: string;
    status: string;
}

const BASE_URL = 'https://scic-chatbot.cml.apps.cdp-ds-test.aramco.com';

export const generateResponse = async (
    message: string,
    userInfo: UserInfo,
    onChunk?: (partial: string) => void
): Promise<ChatbotResponse> => {
    let content = '';

    try {
        const apiResponse = await fetch(
            `${BASE_URL}/api/chat?query=${encodeURIComponent(message)}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'text/event-stream',
                    'Content-Type': 'application/json',
                    'X-Session-Id': userInfo.session_id,
                    'X-User-Id': userInfo.user_id,
                },
            }
        );

        if (!apiResponse.ok || !apiResponse.body) {
            throw new Error(`API responded with status: ${apiResponse.status}`);
        }

        const reader = apiResponse.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            const chunkValue = decoder.decode(value || new Uint8Array(), { stream: true });
            content += chunkValue;
            onChunk?.(chunkValue);
        }

        return {
            content,
            metadata: {
                timestamp: new Date().toISOString(),
            },
        };

    } catch (error) {
        console.error('Error calling chatbot DEV API:', error);
        content = `
            <p>I'm currently having trouble connecting to my knowledge base. Please try again in a moment.</p>
            <p>In the meantime, you might find helpful information in our FAQ section below.</p>
          `;
    }
    return {
        content,
        metadata: {
            timestamp: new Date().toISOString(),
        },
    };
};

export const fetchMatchingFAQs = async (userInfo?: UserInfo): Promise<any[]> => {
    try {
        const headers: Record<string, string> = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };

        if (userInfo) {
            headers['session_id'] = userInfo.session_id;
            headers['user_id'] = userInfo.user_id;
        }

        const response = await fetch(`${BASE_URL}/api/faq`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            throw new Error(`FAQ API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data.faqs)) {
            return data.faqs;
        } else {
            console.warn('Unexpected FAQ API response (DEV):', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching FAQs (DEV):', error);
        return [];
    }
};

export const submitPositiveFeedback = async (
    messageId: string,
    userInfo: UserInfo,
    airesponse: any,
    originalPrompt: string | undefined
): Promise<FeedbackResponse> => {
    const payload = {
        rating: 'like',
        message_id: messageId,
        comment: '',
        user_query: originalPrompt,
        ai_response: airesponse.content,
        tags: [],
    };

    const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userInfo.user_id,
            'X-Session-Id': userInfo.session_id,
        },
        body: JSON.stringify(payload),
    });

    if (res.status !== 201) {
        throw new Error(`Unexpected status code: ${res.status}`);
    }

    return res.json();
};

export const submitNegativeFeedback = async (
    messageId: string,
    userInfo: UserInfo,
    airesponse: any,
    originalPrompt: string | undefined,
    comments: any,
    tags: string[] = []
): Promise<FeedbackResponse> => {
    const payload = {
        rating: 'dislike',
        message_id: messageId,
        comment: comments,
        user_query: originalPrompt,
        ai_response: airesponse.content,
        tags: ["missing_data", "needs_context"],
    };

    const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userInfo.user_id,
            'X-Session-Id': userInfo.session_id,
        },
        body: JSON.stringify(payload),
    });

    if (res.status !== 201) {
        throw new Error(`Unexpected status code: ${res.status}`);
    }

    return res.json();
};


