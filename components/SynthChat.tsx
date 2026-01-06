'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Users, Plus, Search, ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { createClient } from '@/utils/supabase/client';

interface ChatRoom {
  id: string;
  sandbox_id: string | null;
  name: string;
  description: string | null;
  participant_count: number;
  is_connected?: boolean;
  participants: Array<{ email: string; role: string; name?: string }>;
  last_message?: {
    message: string;
    created_at: string;
    sender_email: string;
  };
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_email: string;
  sender_role: 'contributor' | 'operator' | 'creator';
  message: string;
  created_at: string;
  sender_name?: string;
}

interface SynthChatProps {
  embedded?: boolean; // If true, render directly without dialog/button
}

export function SynthChat({ embedded = false }: SynthChatProps = {}) {
  const [isOpen, setIsOpen] = useState(embedded); // Auto-open if embedded
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<
    Array<{ email: string; role: string; name?: string }>
  >([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSandboxName, setNewSandboxName] = useState('');
  const [newSandboxDescription, setNewSandboxDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [filter, setFilter] = useState<'all' | 'connected' | 'available'>('all');
  const [joining, setJoining] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current user email
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setCurrentUserEmail(user.email);
      }
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const joinRoom = useCallback(async (roomId: string) => {
    try {
      await fetch('/api/synthchat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId }),
      });
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/synthchat/rooms');
      if (response.ok) {
        const data = await response.json();
        const roomsData = data.rooms || [];

        // Fetch last message for each room
        const roomsWithLastMessage = await Promise.all(
          roomsData.map(async (room: ChatRoom) => {
            try {
              const msgResponse = await fetch(`/api/synthchat/rooms/${room.id}/messages?limit=1`);
              if (msgResponse.ok) {
                const msgData = await msgResponse.json();
                const lastMsg = msgData.messages?.[msgData.messages.length - 1];
                return {
                  ...room,
                  last_message: lastMsg
                    ? {
                        message: lastMsg.message,
                        created_at: lastMsg.created_at,
                        sender_email: lastMsg.sender_email,
                      }
                    : undefined,
                };
              }
            } catch (error) {
              console.error('Failed to fetch last message:', error);
            }
            return room;
          })
        );

        setRooms(roomsWithLastMessage);
        // Auto-select Syntheverse room if available
        const syntheverseRoom = roomsWithLastMessage.find((r: ChatRoom) => !r.sandbox_id);
        if (syntheverseRoom && !currentRoom) {
          setCurrentRoom(syntheverseRoom);
          await joinRoom(syntheverseRoom.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  }, [currentRoom, joinRoom]);

  const fetchMessages = useCallback(async () => {
    if (!currentRoom) return;

    try {
      const response = await fetch(`/api/synthchat/rooms/${currentRoom.id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [currentRoom]);

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen, fetchRooms]);

  useEffect(() => {
    if (currentRoom) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [currentRoom, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRoomChange = async (room: ChatRoom) => {
    // If not connected, join first
    if (!room.is_connected) {
      await handleJoinRoom(room.id);
    }
    setCurrentRoom(room);
    setMessages([]);
    setShowSidebar(false); // Hide sidebar on mobile when selecting a room
    await joinRoom(room.id);
    // Explicitly fetch messages after room change
    await fetchMessages();
  };

  const handleJoinRoom = async (roomId: string) => {
    setJoining(roomId);
    try {
      await joinRoom(roomId);
      // Refresh rooms to update connection status
      await fetchRooms();
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      setJoining(null);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    if (roomId === currentRoom?.id) {
      setCurrentRoom(null);
      setMessages([]);
    }
    setLeaving(roomId);
    try {
      const response = await fetch(`/api/synthchat/rooms/${roomId}/leave`, {
        method: 'POST',
      });
      if (response.ok) {
        // Refresh rooms to update connection status
        await fetchRooms();
      }
    } catch (error) {
      console.error('Failed to leave room:', error);
    } finally {
      setLeaving(null);
    }
  };

  const sendMessage = async () => {
    if (!currentRoom || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/synthchat/rooms/${currentRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages();
        // Update rooms to refresh last message
        await fetchRooms();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCreateSandbox = async () => {
    if (!newSandboxName.trim() || creating) return;

    setCreating(true);
    try {
      const response = await fetch('/api/synthchat/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSandboxName,
          description: newSandboxDescription || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNewSandboxName('');
        setNewSandboxDescription('');
        setShowCreateDialog(false);
        // Refresh rooms and switch to new room
        await fetchRooms();
        if (data.room) {
          setCurrentRoom(data.room);
          await joinRoom(data.room.id);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create sandbox');
      }
    } catch (error) {
      console.error('Failed to create sandbox:', error);
      alert('Failed to create sandbox');
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSenderDisplayName = (msg: ChatMessage) => {
    return msg.sender_name || msg.sender_email.split('@')[0];
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'connected') {
      return matchesSearch && room.is_connected;
    } else if (filter === 'available') {
      return matchesSearch && !room.is_connected;
    }
    return matchesSearch;
  });


  // If embedded, render directly without dialog
  const chatContent = (
    <div className={embedded ? 'flex h-full h-[600px] w-full' : 'flex h-full'}>
      <div className="flex h-full w-full">
        {/* Sidebar - Sandbox List (WhatsApp conversation list style) */}
        <div
              className={`${
                showSidebar ? 'flex' : 'hidden'
              } w-full flex-col border-r border-[var(--keyline-primary)] bg-[var(--cockpit-bg)] md:flex md:w-1/3`}
            >
              {/* Sidebar Header */}
              <div className="border-b border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="cockpit-title text-lg">Chat Navigator</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCreateDialog(true)}
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                  <Input
                    placeholder="Search sandboxes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="cockpit-input bg-[var(--cockpit-bg)] pl-10"
                  />
                </div>
                {/* Filter Tabs */}
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="flex-1 text-xs"
                  >
                    All ({rooms.length})
                  </Button>
                  <Button
                    variant={filter === 'connected' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('connected')}
                    className="flex-1 text-xs"
                  >
                    Connected ({rooms.filter((r) => r.is_connected).length})
                  </Button>
                  <Button
                    variant={filter === 'available' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('available')}
                    className="flex-1 text-xs"
                  >
                    Available ({rooms.filter((r) => !r.is_connected).length})
                  </Button>
                </div>
              </div>

              {/* Chat Rooms Table - Similar to PoC Archive */}
              <div className="flex-1 overflow-x-auto">
                {loading ? (
                  <div className="cockpit-text p-8 text-center opacity-60">
                    Loading chat rooms...
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="cockpit-text p-8 text-center opacity-60">
                    {searchTerm ? 'No chat rooms found' : 'No chat rooms yet'}
                  </div>
                ) : (
                  <table className="cockpit-table">
                    <thead>
                      <tr>
                        <th>Room Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Participants</th>
                        <th>Last Message</th>
                        <th>Last Activity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRooms.map((room) => {
                        const isActive = currentRoom?.id === room.id;
                        return (
                          <tr
                            key={room.id}
                            onClick={() => handleRoomChange(room)}
                            className={`cursor-pointer ${isActive ? 'bg-[var(--cockpit-carbon)]' : ''}`}
                          >
                            <td>
                              <div className="font-medium">{room.name}</div>
                              {room.sandbox_id && (
                                <div className="cockpit-text mt-1 text-xs opacity-60">
                                  Sandbox Chat
                                </div>
                              )}
                            </td>
                            <td className="cockpit-text text-sm">
                              {room.description || '—'}
                            </td>
                            <td>
                              {room.is_connected ? (
                                <span className="cockpit-badge bg-green-500/20 text-green-400 border-green-500/50">
                                  Connected
                                </span>
                              ) : (
                                <span className="cockpit-badge bg-gray-500/20 text-gray-400 border-gray-500/50">
                                  Available
                                </span>
                              )}
                            </td>
                            <td className="cockpit-text text-sm">
                              {room.participant_count} {room.participant_count === 1 ? 'member' : 'members'}
                            </td>
                            <td className="cockpit-text text-sm">
                              {room.last_message ? (
                                <div>
                                  <div className="truncate max-w-[200px]">
                                    {room.last_message.sender_email === currentUserEmail
                                      ? 'You: '
                                      : ''}
                                    {room.last_message.message}
                                  </div>
                                </div>
                              ) : (
                                <span className="opacity-60">No messages yet</span>
                              )}
                            </td>
                            <td className="cockpit-text text-sm">
                              {room.last_message
                                ? formatTime(room.last_message.created_at)
                                : '—'}
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                {room.is_connected ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLeaveRoom(room.id);
                                    }}
                                    disabled={leaving === room.id}
                                    className="h-6 text-xs text-red-400 hover:text-red-300"
                                  >
                                    {leaving === room.id ? 'Leaving...' : 'Leave'}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleJoinRoom(room.id);
                                    }}
                                    disabled={joining === room.id}
                                    className="h-6 text-xs text-green-400 hover:text-green-300"
                                  >
                                    {joining === room.id ? 'Joining...' : 'Join'}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Main Chat View (WhatsApp style) */}
            <div
              className={`${
                showSidebar ? 'hidden' : 'flex'
              } w-full flex-col bg-[var(--cockpit-bg)] md:flex md:w-2/3`}
            >
              {!currentRoom ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="mx-auto mb-4 h-16 w-16 opacity-40" />
                    <p className="cockpit-text opacity-60">Select a sandbox to start chatting</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between border-b border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setShowSidebar(true);
                          setCurrentRoom(null);
                        }}
                        className="h-8 w-8 md:hidden"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="from-[var(--hydrogen-amber)]/30 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br to-purple-500/30 text-sm font-semibold">
                        {currentRoom.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="cockpit-title text-sm font-medium">{currentRoom.name}</h3>
                        <p className="cockpit-text text-xs opacity-60">
                          {participants.length} {participants.length === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Messages Area - WhatsApp Style */}
                  <div
                    ref={messagesContainerRef}
                    className="to-[var(--cockpit-carbon)]/30 flex-1 overflow-y-auto bg-gradient-to-b from-[var(--cockpit-bg)] p-4"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  >
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-40" />
                          <p className="cockpit-text opacity-60">
                            No messages yet. Start the conversation!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {messages.map((msg, index) => {
                          const isCurrentUser = msg.sender_email === currentUserEmail;
                          const prevMsg = index > 0 ? messages[index - 1] : null;
                          const showAvatar = !prevMsg || prevMsg.sender_email !== msg.sender_email;
                          const showTime =
                            index === messages.length - 1 ||
                            new Date(msg.created_at).getTime() -
                              new Date(messages[index + 1].created_at).getTime() >
                              300000; // 5 minutes

                          return (
                            <div
                              key={msg.id}
                              className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-1`}
                            >
                              {/* Avatar (only for others, on left) */}
                              {!isCurrentUser && (
                                <div className="mb-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-xs font-semibold">
                                  {showAvatar ? (
                                    getInitials(getSenderDisplayName(msg))
                                  ) : (
                                    <div className="w-8" />
                                  )}
                                </div>
                              )}

                              {/* Message Bubble */}
                              <div
                                className={`max-w-[70%] md:max-w-[60%] ${
                                  isCurrentUser ? 'items-end' : 'items-start'
                                } flex flex-col`}
                              >
                                {!isCurrentUser && showAvatar && (
                                  <span className="cockpit-text mb-1 px-1 text-xs opacity-75">
                                    {getSenderDisplayName(msg)}
                                  </span>
                                )}
                                <div
                                  className={`rounded-2xl px-4 py-2 ${
                                    isCurrentUser
                                      ? 'rounded-tr-sm bg-[#dcf8c6] text-[#111b21]'
                                      : 'rounded-tl-sm bg-white text-[#111b21]'
                                  } shadow-sm`}
                                >
                                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {msg.message}
                                  </p>
                                  <div
                                    className={`mt-1 flex items-center gap-1 ${
                                      isCurrentUser ? 'justify-end' : 'justify-start'
                                    }`}
                                  >
                                    <span className="text-xs opacity-70">
                                      {formatMessageTime(msg.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Spacer for alignment */}
                              {isCurrentUser && <div className="w-8 flex-shrink-0" />}
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Input Area - WhatsApp Style */}
                  <div className="border-t border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="cockpit-input focus:ring-[var(--hydrogen-amber)]/50 flex-1 rounded-full border-0 bg-white text-[#111b21] focus:ring-2"
                        disabled={sending}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="hover:bg-[var(--hydrogen-amber)]/90 h-10 w-10 rounded-full bg-[var(--hydrogen-amber)] p-0 text-white"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
    </div>
  );

  return (
    <>
      {/* Chat Button - only show if not embedded */}
      {!embedded && (
        <Button
          onClick={() => setIsOpen(true)}
          className="cockpit-lever inline-block"
          variant="outline"
        >
          <MessageCircle className="mr-2 inline h-4 w-4" />
          SynthChat
        </Button>
      )}

      {/* WhatsApp-Style Chat Interface */}
      {embedded ? (
        chatContent
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="cockpit-panel h-[85vh] max-w-6xl overflow-hidden border-[var(--keyline-primary)] p-0">
            {chatContent}
          </DialogContent>
        </Dialog>
      )}

      {/* Create New Sandbox Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="cockpit-panel border-[var(--keyline-primary)]">
          <DialogHeader>
            <DialogTitle className="cockpit-title">Create New Sandbox</DialogTitle>
            <DialogDescription className="cockpit-text">
              Create a new collaborative chat sandbox for your project or team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="sandbox-name" className="cockpit-label">
                Sandbox Name *
              </Label>
              <Input
                id="sandbox-name"
                value={newSandboxName}
                onChange={(e) => setNewSandboxName(e.target.value)}
                placeholder="My Project Sandbox"
                className="cockpit-input mt-2"
                disabled={creating}
              />
            </div>
            <div>
              <Label htmlFor="sandbox-description" className="cockpit-label">
                Description (optional)
              </Label>
              <textarea
                id="sandbox-description"
                value={newSandboxDescription}
                onChange={(e) => setNewSandboxDescription(e.target.value)}
                placeholder="Describe what this sandbox is for..."
                className="cockpit-input mt-2 min-h-[80px] w-full resize-y rounded-md border border-[var(--keyline-primary)] bg-[var(--cockpit-carbon)] px-3 py-2 text-sm"
                rows={3}
                disabled={creating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewSandboxName('');
                setNewSandboxDescription('');
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSandbox}
              disabled={!newSandboxName.trim() || creating}
              className="cockpit-lever"
            >
              {creating ? 'Creating...' : 'Create Sandbox'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
