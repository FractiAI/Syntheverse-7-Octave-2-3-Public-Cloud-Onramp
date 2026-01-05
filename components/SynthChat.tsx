'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Users, ChevronDown, Plus } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/utils/supabase/client';

interface ChatRoom {
  id: string;
  sandbox_id: string | null;
  name: string;
  description: string | null;
  participant_count: number;
  participants: Array<{ email: string; role: string; name?: string }>;
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

export function SynthChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Array<{ email: string; role: string; name?: string }>>([]);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSandboxName, setNewSandboxName] = useState('');
  const [newSandboxDescription, setNewSandboxDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isOpen) {
      fetchRooms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentRoom) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [currentRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/synthchat/rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
        // Auto-select Syntheverse room if available
        const syntheverseRoom = data.rooms?.find((r: ChatRoom) => !r.sandbox_id);
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
  };

  const joinRoom = async (roomId: string) => {
    try {
      await fetch('/api/synthchat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId }),
      });
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const fetchMessages = async () => {
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
  };

  const handleRoomChange = async (room: ChatRoom) => {
    setCurrentRoom(room);
    setMessages([]);
    await joinRoom(room.id);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'creator':
        return 'bg-purple-600/20 text-purple-300 border-purple-500/30';
      case 'operator':
        return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-[var(--hydrogen-amber)]/20 text-[var(--hydrogen-amber)] border-[var(--hydrogen-amber)]/30';
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="cockpit-lever inline-block"
        variant="outline"
      >
        <MessageCircle className="mr-2 inline h-4 w-4" />
        SynthChat
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="cockpit-panel flex h-[700px] max-w-4xl flex-col border-[var(--keyline-primary)] p-0">
          <DialogHeader className="border-b border-[var(--keyline-primary)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DialogTitle className="cockpit-title">SynthChat</DialogTitle>
                {currentRoom && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="cockpit-lever">
                        {currentRoom.name}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="cockpit-panel border-[var(--keyline-primary)]">
                      {rooms.map((room) => (
                        <DropdownMenuItem
                          key={room.id}
                          onClick={() => handleRoomChange(room)}
                          className="cockpit-text cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{room.name}</span>
                            <span className="text-xs opacity-60">
                              {room.participant_count} {room.participant_count === 1 ? 'user' : 'users'}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowCreateDialog(true)}
                        className="cockpit-text cursor-pointer"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Sandbox
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="flex items-center gap-2">
                {currentRoom && (
                  <div className="cockpit-text mr-4 flex items-center gap-2 text-xs opacity-75">
                    <Users className="h-4 w-4" />
                    {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {!currentRoom ? (
              <div className="cockpit-text flex h-full items-center justify-center text-center opacity-60">
                <div>
                  <MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-40" />
                  <p>Select a sandbox to start chatting</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="cockpit-text flex h-full items-center justify-center text-center opacity-60">
                <div>
                  <MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-40" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = msg.sender_email === currentUserEmail;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-[var(--hydrogen-amber)]/20 border border-[var(--hydrogen-amber)]/30'
                          : 'bg-[var(--cockpit-carbon)] border border-[var(--keyline-primary)]'
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`cockpit-label rounded border px-2 py-0.5 text-xs ${getRoleBadgeColor(msg.sender_role)}`}>
                          {msg.sender_role === 'creator' ? 'Creator' : msg.sender_role === 'operator' ? 'Operator' : 'Contributor'}
                        </span>
                        <span className="cockpit-text text-xs opacity-75">
                          {msg.sender_name || msg.sender_email.split('@')[0]}
                        </span>
                      </div>
                      <div className="cockpit-text text-sm">{msg.message}</div>
                      <div className="cockpit-text mt-1 text-xs opacity-50">
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[var(--keyline-primary)] p-4">
            {currentRoom ? (
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${currentRoom.name}...`}
                  className="cockpit-input flex-1"
                  disabled={sending}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="cockpit-lever"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="cockpit-text text-center text-sm opacity-60">
                Select a sandbox to start chatting
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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

