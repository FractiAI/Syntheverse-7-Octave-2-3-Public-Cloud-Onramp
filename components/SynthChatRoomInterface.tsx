/**
 * SynthChat Room Interface
 * WhatsApp/iPhone-style chat interface with:
 * - Message search functionality
 * - Image upload support
 * - File (PDF) upload support
 * - Real-time messaging
 * - Responsive mobile-first design
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Search, 
  X, 
  Image as ImageIcon, 
  FileText,
  Paperclip,
  MoreVertical,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  room_id: string;
  sender_email: string;
  sender_role: 'contributor' | 'operator' | 'creator';
  message: string;
  created_at: string;
  sender_name?: string;
  image_url?: string | null;
  file_url?: string | null;
  file_name?: string | null;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  participant_count: number;
  participants: Array<{ email: string; role: string; name?: string }>;
}

interface SynthChatRoomInterfaceProps {
  roomId: string;
  userEmail: string;
  searchTerm?: string;
}

export function SynthChatRoomInterface({ 
  roomId, 
  userEmail,
  searchTerm: initialSearchTerm = '' 
}: SynthChatRoomInterfaceProps) {
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [showSearch, setShowSearch] = useState(!!initialSearchTerm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch room details
  useEffect(() => {
    console.log('[SynthChatRoomInterface] useEffect triggered for roomId:', roomId);
    fetchRoom();
    
    // Failsafe: if loading takes more than 10 seconds, show error
    const timeout = setTimeout(() => {
      if (loading) {
        console.error('[SynthChatRoomInterface] Loading timeout - forcing error state');
        setError('Chat room took too long to load. Please try again.');
        setLoading(false);
      }
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [roomId]);

  // Fetch messages
  useEffect(() => {
    if (room) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll every 3s
      return () => clearInterval(interval);
    }
  }, [room]);

  // Filter messages based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMessages(messages);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = messages.filter(msg => 
        msg.message.toLowerCase().includes(term) ||
        msg.sender_name?.toLowerCase().includes(term) ||
        msg.sender_email.toLowerCase().includes(term)
      );
      setFilteredMessages(filtered);
    }
  }, [searchTerm, messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && !showSearch) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages, showSearch]);

  const fetchRoom = async () => {
    console.log('[SynthChatRoomInterface] fetchRoom START for roomId:', roomId);
    try {
      const url = `/api/synthchat/rooms/${roomId}`;
      console.log('[SynthChatRoomInterface] Fetching:', url);
      
      const response = await fetch(url);
      console.log('[SynthChatRoomInterface] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[SynthChatRoomInterface] Room data:', data.room);
        setRoom(data.room);
        setError(null);
      } else {
        const data = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[SynthChatRoomInterface] Error response:', data);
        setError(data.error || 'Failed to load room');
      }
    } catch (error) {
      console.error('[SynthChatRoomInterface] Fetch error:', error);
      setError('Failed to connect to chat room');
    } finally {
      console.log('[SynthChatRoomInterface] Setting loading to false');
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/synthchat/rooms/${roomId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setError(null);
      } else {
        const data = await response.json();
        console.error('Failed to fetch messages:', data.error);
        // Don't set error state for message fetch failures to avoid blocking UI
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      // Don't set error state for message fetch failures to avoid blocking UI
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('room_id', roomId);

      const response = await fetch('/api/synthchat/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedImage(data.url);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF only for now)
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    // Validate file size (10MB for PDFs)
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('room_id', roomId);

      const response = await fetch('/api/synthchat/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedFile({ name: file.name, url: data.url });
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedImage && !selectedFile) || sending) return;

    setSending(true);
    try {
      const payload: any = {
        room_id: roomId,
        message: newMessage.trim() || (selectedImage ? '[Image]' : '[File]'),
      };

      if (selectedImage) {
        payload.image_url = selectedImage;
      }

      if (selectedFile) {
        payload.file_url = selectedFile.url;
        payload.file_name = selectedFile.name;
      }

      const response = await fetch('/api/synthchat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setNewMessage('');
        setSelectedImage(null);
        setSelectedFile(null);
        await fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  if (loading) {
    console.log('[SynthChatRoomInterface] Rendering loading state');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <div className="text-xl font-semibold mb-2">Loading Chat Room...</div>
          <div className="text-sm text-gray-500">Room ID: {roomId}</div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg mb-4">{error || 'Chat room not found'}</div>
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - WhatsApp/iPhone style */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-lg truncate">{room.name}</h1>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users className="h-3 w-3" />
            <span>{room.participant_count} participant{room.participant_count !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Search Bar (conditional) */}
      {showSearch && (
        <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-xs text-gray-500">
              Found {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ 
          backgroundColor: '#efeae2' 
        }}
      >
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            {searchTerm ? 'No messages found' : 'No messages yet'}
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.sender_email === userEmail;
            const senderName = msg.sender_name || msg.sender_email.split('@')[0];

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] md:max-w-[65%] rounded-lg px-3 py-2 shadow ${
                    isMe
                      ? 'bg-green-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {!isMe && (
                    <div className="text-xs font-semibold mb-1 opacity-75">
                      {senderName}
                    </div>
                  )}
                  
                  {/* Image */}
                  {msg.image_url && (
                    <img
                      src={msg.image_url}
                      alt="Attached image"
                      className="rounded mb-2 max-w-full h-auto cursor-pointer"
                      onClick={() => window.open(msg.image_url!, '_blank')}
                    />
                  )}

                  {/* File */}
                  {msg.file_url && (
                    <a
                      href={msg.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 mb-2 p-2 rounded ${
                        isMe ? 'bg-green-600' : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="text-sm truncate">{msg.file_name || 'File'}</span>
                    </a>
                  )}

                  {/* Message text */}
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {msg.message}
                  </div>

                  <div
                    className={`text-[10px] mt-1 ${
                      isMe ? 'text-green-100' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {(selectedImage || selectedFile) && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {selectedImage && (
              <div className="relative">
                <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {selectedFile && (
              <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-3 py-2 rounded">
                <FileText className="h-4 w-4" />
                <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input Area - WhatsApp style */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              disabled={uploadingImage || uploadingFile}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 space-y-1">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="text-sm">Image</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick upload buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingImage}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
          >
            <FileText className="h-5 w-5" />
          </Button>

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Message input */}
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-full"
            disabled={sending}
          />

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={sending || (!newMessage.trim() && !selectedImage && !selectedFile)}
            size="icon"
            className="rounded-full bg-green-500 hover:bg-green-600 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {(uploadingImage || uploadingFile) && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Uploading...
          </div>
        )}
      </div>
    </div>
  );
}

