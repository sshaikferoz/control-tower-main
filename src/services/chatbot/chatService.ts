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

export const generateResponse = async (
  message: string,
  userInfo: UserInfo
): Promise<ChatbotResponse> => {
  // Check if message matches any FAQ
  let content = '';

  // Call API with user info in headers
  try {
    const apiResponse = await fetch(
      `https://scic-chatbot.cml.apps.cdp-ds-test.aramco.com/api/chat?query=${encodeURIComponent(message)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Session-Id': userInfo.session_id,
          'X-User-Id': userInfo.user_id,
        },
      }
    );

    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    if (data && data.ai_result) {
      // Return the chatbot response from the API
      content = data.ai_result;
    } else {
      // Fallback if API doesn't return expected format
      content = `
              <p>I couldn't find specific information about that. Could you please try rephrasing your question?</p>
              <p>I can help with questions about inventory management, purchase orders, and supply chain topics.</p>
            `;
    }
  } catch (error) {
    console.error('Error calling chatbot API:', error);
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

    // Add user info headers if available
    if (userInfo) {
      headers['session_id'] = userInfo.session_id;
      headers['user_id'] = userInfo.user_id;
    }

    const response = await fetch(`https://scic-chatbot.cml.apps.cdp-ds-test.aramco.com/api/faq`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`FAQ API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Assume the response format is: { faqs: [{ question, answer }] }
    if (data && Array.isArray(data.faqs)) {
      return data.faqs;
    } else {
      console.warn('Unexpected FAQ API response:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
};
