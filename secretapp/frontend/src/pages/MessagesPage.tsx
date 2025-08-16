import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { User, ChatMessage, Conversation } from '../types';

const MessagesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    
    // Check if there's a specific user to start conversation with
    const userId = searchParams.get('user');
    if (userId) {
      startNewConversation(userId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const mockConversations: Conversation[] = [
        {
          _id: '1',
          participants: [
            currentUser!._id,
            '2'
          ],
          lastMessage: {
            _id: 'msg1',
            sender: {
              _id: '2',
              firstName: 'John',
              lastName: 'Smith',
              profilePicture: undefined
            },
            content: 'Thanks for connecting! Looking forward to collaborating.',
            messageType: 'text',
            attachments: [],
            timestamp: new Date().toISOString(),
            readBy: [{ userId: currentUser!._id, readAt: new Date().toISOString() }],
            reactions: [],
            isEdited: false,
            isDeleted: false
          },
          unreadCount: 0,
          isGroup: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          participants: [
            currentUser!._id,
            '3'
          ],
          lastMessage: {
            _id: 'msg2',
            sender: {
              _id: '3',
              firstName: 'Sarah',
              lastName: 'Johnson',
              profilePicture: undefined
            },
            content: 'Can we schedule a call to discuss the manufacturing requirements?',
            messageType: 'text',
            attachments: [],
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            readBy: [],
            reactions: [],
            isEdited: false,
            isDeleted: false
          },
          unreadCount: 2,
          isGroup: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setConversations(mockConversations);
      
      if (mockConversations.length > 0 && !activeConversation) {
        setActiveConversation(mockConversations[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      // TODO: Replace with actual API call
      const mockMessages: ChatMessage[] = [
        {
          _id: 'msg1',
          senderId: '2',
          recipientId: currentUser!._id,
          content: 'Hi! I saw your profile and I\'m interested in your manufacturing capabilities.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          messageType: 'text'
        },
        {
          _id: 'msg2',
          senderId: currentUser!._id,
          recipientId: '2',
          content: 'Thank you for reaching out! I\'d be happy to discuss potential collaboration opportunities.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          messageType: 'text'
        },
        {
          _id: 'msg3',
          senderId: '2',
          recipientId: currentUser!._id,
          content: 'Thanks for connecting! Looking forward to collaborating.',
          timestamp: new Date().toISOString(),
          read: true,
          messageType: 'text'
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const startNewConversation = async (userId: string) => {
    // TODO: Create new conversation or find existing one
    console.log('Starting conversation with user:', userId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || isSending) return;

    setIsSending(true);
    try {
      const message: ChatMessage = {
        _id: Date.now().toString(),
        senderId: currentUser!._id,
        recipientId: activeConversation.participants.find(p => p !== currentUser!._id) || '',
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false,
        messageType: 'text'
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // TODO: Send message via API
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return date.toLocaleDateString();
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getOtherParticipant = (conversation: Conversation): User | null => {
    // TODO: Get user details for the other participant
    const otherUserId = conversation.participants.find(p => p !== currentUser!._id);
    
    // Mock user data
    const mockUsers: Record<string, User> = {
      '2': {
        _id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        age: 32,
        gender: 'Female',
        phoneNumber: '+1234567890',
        location: { city: 'Chicago', state: 'IL', country: 'USA' },
        headline: 'Manufacturing Operations Manager',
        profileTypes: ['Manufacturer'],
        profileTypeData: {},
        skills: [],
        education: [],
        experience: [],
        connections: [],
        followers: [],
        following: [],
        isVerified: true,
        isEmailVerified: true,
        privacySettings: {
          profileVisibility: 'public',
          contactInfoVisible: true,
          lastSeenVisible: true,
          allowMessagesFrom: 'everyone'
        },
        lastActive: new Date().toISOString(),
        profileViews: { count: 0, viewers: [] },
        notifications: {
          email: true,
          push: true,
          connectionRequests: true,
          messages: true,
          postEngagement: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      '3': {
        _id: '3',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael@example.com',
        age: 29,
        gender: 'Male',
        phoneNumber: '+1234567891',
        location: { city: 'San Francisco', state: 'CA', country: 'USA' },
        headline: 'Supply Chain Director',
        profileTypes: ['Distributor'],
        profileTypeData: {},
        skills: [],
        education: [],
        experience: [],
        connections: [],
        followers: [],
        following: [],
        isVerified: false,
        isEmailVerified: true,
        privacySettings: {
          profileVisibility: 'public',
          contactInfoVisible: true,
          lastSeenVisible: true,
          allowMessagesFrom: 'everyone'
        },
        lastActive: new Date(Date.now() - 1800000).toISOString(),
        profileViews: { count: 0, viewers: [] },
        notifications: {
          email: true,
          push: true,
          connectionRequests: true,
          messages: true,
          postEngagement: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    return otherUserId ? mockUsers[otherUserId] || null : null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          
          {/* Search */}
          <div className="mt-3 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations
            .filter(conv => {
              if (!searchQuery) return true;
              const otherUser = getOtherParticipant(conv);
              return otherUser?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     otherUser?.lastName.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              if (!otherUser) return null;

              return (
                <div
                  key={conversation._id}
                  onClick={() => setActiveConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    activeConversation?._id === conversation._id ? 'bg-blue-50 border-r-2 border-r-linkedin-blue' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                        {otherUser.profilePicture ? (
                          <img
                            src={otherUser.profilePicture}
                            alt={`${otherUser.firstName} ${otherUser.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linkedin-blue flex items-center justify-center text-white font-bold">
                            {otherUser.firstName[0]}{otherUser.lastName[0]}
                          </div>
                        )}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {otherUser.firstName} {otherUser.lastName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage?.timestamp || conversation.updatedAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      
                      {conversation.unreadCount > 0 && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-linkedin-blue text-white">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {(() => {
                  const otherUser = getOtherParticipant(activeConversation);
                  return (
                    <>
                      <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
                        {otherUser?.profilePicture ? (
                          <img
                            src={otherUser.profilePicture}
                            alt={`${otherUser.firstName} ${otherUser.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linkedin-blue flex items-center justify-center text-white font-bold text-sm">
                            {otherUser?.firstName[0]}{otherUser?.lastName[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">
                          {otherUser?.firstName} {otherUser?.lastName}
                        </h2>
                        <p className="text-sm text-gray-600">{otherUser?.headline}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <PhoneIcon className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <VideoCameraIcon className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === currentUser!._id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-linkedin-blue text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={sendMessage} className="flex items-end space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full p-3 pr-20 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                    />
                    <div className="absolute right-2 bottom-2 flex space-x-1">
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <PaperClipIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <FaceSmileIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="p-3 bg-linkedin-blue text-white rounded-lg hover:bg-linkedin-blue-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <PaperAirplaneIcon className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Welcome to Messages</h2>
              <p className="text-gray-600">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
