import { ChatConversation, ChatMessage, ChatUser } from '@/types/chat';

// Datos Mock
const MOCK_USERS: ChatUser[] = [
  {
    id: 'u1',
    name: 'Ana García',
    avatar: 'https://i.pravatar.cc/150?u=u1',
    status: 'online',
    email: 'ana.garcia@example.com',
  },
  {
    id: 'u2',
    name: 'Carlos Rodríguez',
    avatar: 'https://i.pravatar.cc/150?u=u2',
    status: 'offline',
    email: 'carlos.rodriguez@example.com',
  },
  {
    id: 'u3',
    name: 'María López',
    avatar: 'https://i.pravatar.cc/150?u=u3',
    status: 'busy',
    email: 'maria.lopez@example.com',
  },
];

const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'c1',
    user: MOCK_USERS[0],
    lastMessage: 'Hola, ¿podemos revisar el acta pendiente?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // Hace 5 min
    unreadCount: 2,
  },
  {
    id: 'c2',
    user: MOCK_USERS[1],
    lastMessage: 'Te envié los documentos actualizados.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // Hace 2 horas
    unreadCount: 0,
  },
  {
    id: 'c3',
    user: MOCK_USERS[2],
    lastMessage: 'Gracias por la ayuda.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Hace 1 día
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: 'm1',
      senderId: 'u1',
      content: 'Hola Admin, buen día.',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      isMine: false,
    },
    {
      id: 'm2',
      senderId: 'me',
      content: 'Hola Ana, dime en qué puedo ayudarte.',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      isMine: true,
    },
    {
      id: 'm3',
      senderId: 'u1',
      content: 'Hola, ¿podemos revisar el acta pendiente?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isMine: false,
    },
  ],
  c2: [
    {
      id: 'm1',
      senderId: 'u2',
      content: 'Te envié los documentos actualizados.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isMine: false,
    },
  ],
  c3: [
    {
      id: 'm1',
      senderId: 'me',
      content: 'El reporte ya fue generado.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
      isMine: true,
    },
    {
      id: 'm2',
      senderId: 'u3',
      content: 'Gracias por la ayuda.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isMine: false,
    },
  ],
};

class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Simula fetch de conversaciones
  public async getConversations(): Promise<ChatConversation[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MOCK_CONVERSATIONS]);
      }, 500); // Simula latencia de red
    });
  }

  // Simula fetch de mensajes de un chat
  public async getMessages(conversationId: string): Promise<ChatMessage[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_MESSAGES[conversationId] || []);
      }, 300); // Simula latencia de red
    });
  }

  // Simula enviar mensaje
  public async sendMessage(
    conversationId: string,
    content: string
  ): Promise<ChatMessage> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage: ChatMessage = {
          id: Math.random().toString(36).substring(7),
          senderId: 'me',
          content,
          timestamp: new Date().toISOString(),
          isMine: true,
        };
        // En una app real aqui se guardaria, simulamos retorno
        resolve(newMessage);
      }, 200);
    });
  }
}

export const chatService = ChatService.getInstance();
