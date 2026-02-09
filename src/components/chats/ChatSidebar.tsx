import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChatConversation } from '@/types/chat';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string; // Para control de responsividad desde el padre
}

export function ChatSidebar({
  conversations,
  selectedId,
  onSelect,
  className,
}: ChatSidebarProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-full bg-background/50 backdrop-blur-sm',
        className
      )}
    >
      {/* Header del Sidebar */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Mensajes</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar chat..." className="pl-9" />
        </div>
      </div>

      {/* Lista de Chats */}
      {/* Usamos un div con overflow si ScrollArea no está disponible, pero intentaremos usar div nativo por seguridad si ScrollArea falla, 
          aunque el usuario dijo que use componentes existentes. Asumiré que ScrollArea existe o usaré fallback seguro. 
          En la lista de archivos no vi scroll-area.tsx, así que usaré div native con clases de Tailwind.
      */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No hay conversaciones.
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-2">
            {conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelect(chat.id)}
                className={cn(
                  'flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50',
                  selectedId === chat.id ? 'bg-muted' : 'bg-transparent'
                )}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.user.avatar} />
                    <AvatarFallback>
                      {chat.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                      chat.user.status === 'online'
                        ? 'bg-green-500'
                        : chat.user.status === 'busy'
                          ? 'bg-red-500'
                          : 'bg-slate-400'
                    )}
                  />
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      {chat.user.name}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(chat.lastMessageTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {chat.unreadCount > 0 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {chat.unreadCount}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
