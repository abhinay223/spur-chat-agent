export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: Date;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface ConversationHistory {
  messages: Message[];
}
