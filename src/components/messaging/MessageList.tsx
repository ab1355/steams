'use client';

import { Message, User } from '@prisma/client';
import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface MessageListProps {
  messages: (Message & {
    sender: User;
    receiver: User;
  })[];
  currentUserId: string;
  onSendMessage: (content: string, receiverId: string) => Promise<void>;
}

export default function MessageList({ messages: initialMessages, currentUserId, onSendMessage }: MessageListProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message: Message & { sender: User; receiver: User }) => {
        if (
          message.senderId === currentUserId ||
          message.receiverId === currentUserId
        ) {
          setMessages((prev) => [...prev, message]);
        }
      });
    }
  }, [socket, currentUserId]);

  const conversations = messages.reduce((acc, message) => {
    const otherUser = message.senderId === currentUserId ? message.receiver : message.sender;
    if (!acc[otherUser.id]) {
      acc[otherUser.id] = {
        user: otherUser,
        messages: [],
        unreadCount: 0,
      };
    }
    acc[otherUser.id].messages.push(message);
    if (message.receiverId === currentUserId && !message.read) {
      acc[otherUser.id].unreadCount++;
    }
    return acc;
  }, {} as Record<string, { user: User; messages: typeof messages; unreadCount: number }>);

  const handleSend = async () => {
    if (!selectedReceiverId || !newMessage.trim()) return;
    
    try {
      await onSendMessage(newMessage, selectedReceiverId);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow">
      {/* Conversation List */}
      <div className="w-1/3 border-r">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {Object.values(conversations).map(({ user, messages, unreadCount }) => (
            <button
              key={user.id}
              onClick={() => setSelectedReceiverId(user.id)}
              className={`w-full p-4 text-left hover:bg-gray-50 ${
                selectedReceiverId === user.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="font-medium">{user.name}</div>
                {unreadCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {messages[messages.length - 1]?.content}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedReceiverId ? (
          <>
            <div className="p-4 border-b">
              <h3 className="font-medium">
                {conversations[selectedReceiverId].user.name}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversations[selectedReceiverId].messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === currentUserId
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
