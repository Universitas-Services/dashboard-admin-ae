export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  email: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string; // ISO string
  isMine: boolean; // Helper para frontend
}

export interface ChatConversation {
  id: string;
  user: ChatUser;
  lastMessage: string;
  lastMessageTime: string; // ISO string
  unreadCount: number;
}
