const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SendMessageResponse {
  conversationId: string;
  response: string;
  message: ChatMessage;
}

export const chatAPI = {
  sendMessage: async (message: string, conversationId?: string): Promise<SendMessageResponse> => {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId: conversationId, 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send message');
    }

    const data = await response.json();
    console.log('✅ Backend response:', data);

   
    return {
      conversationId: data.sessionId,    
      response: data.reply,              
      message: {
        role: 'assistant',
        content: data.reply,
      },
    };
  },

  getConversation: async (conversationId: string) => {
    const response = await fetch(`${API_URL}/api/conversations/${conversationId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }

    return response.json();
  },
};
