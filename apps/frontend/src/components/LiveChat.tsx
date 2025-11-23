'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  message: string;
  type: 'text' | 'emoji' | 'system' | 'pinned' | 'highlight';
  isPinned: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface LiveChatProps {
  streamId: string;
  userId: string;
  userName: string;
}

export default function LiveChat({ streamId, userId, userName }: LiveChatProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io('/live-chat', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join-stream', { streamId, userId });
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('recent-messages', (msgs: ChatMessage[]) => {
      setMessages(msgs);
    });

    newSocket.on('new-message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('message-deleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    newSocket.on('message-pinned', (msg: ChatMessage) => {
      setPinnedMessage(msg);
    });

    newSocket.on('user-joined', ({ viewerCount: count }: { viewerCount: number }) => {
      setViewerCount(count);
    });

    newSocket.on('user-left', ({ viewerCount: count }: { viewerCount: number }) => {
      setViewerCount(count);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-stream', { streamId, userId });
      newSocket.disconnect();
    };
  }, [streamId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', {
      streamId,
      userId,
      message: newMessage.trim(),
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Live Chat</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          {viewerCount} viewers
        </div>
      </div>

      {/* Pinned message */}
      {pinnedMessage && (
        <div className="bg-blue-50 p-3 border-b">
          <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
            </svg>
            Pinned by host
          </div>
          <p className="text-sm">{pinnedMessage.message}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.type === 'highlight' ? 'bg-yellow-50 -mx-3 px-3 py-2' : ''}`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-sm font-medium">
              {msg.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{msg.user.name}</span>
                <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 break-words">{msg.message}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!connected}
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
