/**
 * SynthChat Navigator Component
 * Table-based chat room navigator similar to PoC Archive and Sandbox Navigator
 * Displays all accessible chat rooms in a cockpit-table format
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, MessageCircle, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export function SynthChatNavigator() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'connected' | 'available'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSandboxName, setNewSandboxName] = useState('');
  const [newSandboxDescription, setNewSandboxDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [leaving, setLeaving] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setCurrentUserEmail(user.email);
      }
    });
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/synthchat/rooms');
      if (response.ok) {
        const data = await response.json();
        const roomsData = data.rooms || [];

        // Last messages are now included in the API response, no need to fetch separately
        setRooms(roomsData);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch rooms' }));
        console.error('Failed to fetch rooms:', response.status, errorData);
        setRooms([]);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLeaving(roomId);
    try {
      const response = await fetch(`/api/synthchat/rooms/${roomId}/leave`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchRooms();
        if (currentRoom?.id === roomId) {
          setCurrentRoom(null);
        }
      }
    } catch (error) {
      console.error('Failed to leave room:', error);
    } finally {
      setLeaving(null);
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
        setNewSandboxName('');
        setNewSandboxDescription('');
        setShowCreateDialog(false);
        await fetchRooms();
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

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'connected') {
      return matchesSearch && room.is_connected;
    } else if (filter === 'available') {
      return matchesSearch && !room.is_connected;
    }
    return matchesSearch;
  });

  return (
    <>
      <div className="cockpit-module cockpit-panel">
        <div className="p-4 md:p-6">
          {/* Module Header */}
          <div className="mb-4 flex items-center justify-between border-b border-[var(--keyline-primary)] pb-3 md:mb-6 md:pb-4">
            <div>
              <div className="cockpit-label">SYNTHCHAT NAVIGATOR</div>
              <div className="cockpit-title mt-1 text-2xl">CHAT ROOMS</div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="cockpit-lever"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Room
              </Button>
              <button
                onClick={() => fetchRooms()}
                className="cockpit-lever px-4 py-2 text-sm"
              >
                <RefreshCw className="mr-2 inline h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-4 flex gap-2 md:mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`cockpit-lever px-4 py-2 text-sm ${filter === 'all' ? 'border-[var(--hydrogen-amber)]' : ''}`}
            >
              All ({rooms.length})
            </button>
            <button
              onClick={() => setFilter('connected')}
              className={`cockpit-lever px-4 py-2 text-sm ${filter === 'connected' ? 'border-[var(--hydrogen-amber)]' : ''}`}
            >
              Connected ({rooms.filter((r) => r.is_connected).length})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`cockpit-lever px-4 py-2 text-sm ${filter === 'available' ? 'border-[var(--hydrogen-amber)]' : ''}`}
            >
              Available ({rooms.filter((r) => !r.is_connected).length})
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Input
              placeholder="Search chat rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cockpit-input pl-10"
            />
            <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center">
              <div className="cockpit-text opacity-60">Loading chat rooms...</div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="py-12 text-center">
              <div className="cockpit-text mb-4">No chat rooms found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="cockpit-table">
                <thead>
                  <tr>
                    <th>Room Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th className="text-right">Participants</th>
                    <th>Last Message</th>
                    <th>Last Activity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => {
                    const isSelected = currentRoom?.id === room.id;
                    return (
                      <tr
                        key={room.id}
                        className={isSelected ? 'bg-[var(--cockpit-carbon)]' : ''}
                      >
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--hydrogen-amber)]/30 to-purple-500/30 text-xs font-semibold">
                              {room.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="font-medium">{room.name}</div>
                          </div>
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
                        <td className="cockpit-number text-right font-mono">
                          {room.participant_count}
                        </td>
                        <td className="cockpit-text text-sm">
                          {room.last_message ? (
                            <div className="truncate max-w-[200px]">
                              {room.last_message.sender_email === currentUserEmail
                                ? 'You: '
                                : ''}
                              {room.last_message.message}
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/synthchat/${room.id}`)}
                              className="h-7 px-3 text-xs cockpit-lever text-[var(--hydrogen-amber)] hover:text-[var(--hydrogen-beta)]"
                            >
                              Open Chat →
                            </Button>
                            {room.is_connected && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLeaveRoom(room.id, e);
                                }}
                                disabled={leaving === room.id}
                                className="h-6 text-xs text-red-400 hover:text-red-300"
                              >
                                {leaving === room.id ? 'Leaving...' : 'Leave'}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create New Room Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="cockpit-panel border-[var(--keyline-primary)]">
          <DialogHeader>
            <DialogTitle className="cockpit-title">Create New Chat Room</DialogTitle>
            <DialogDescription className="cockpit-text">
              Create a new collaborative chat room for your sandbox
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name" className="cockpit-label">
                Room Name
              </Label>
              <Input
                id="name"
                value={newSandboxName}
                onChange={(e) => setNewSandboxName(e.target.value)}
                placeholder="Enter room name"
                className="cockpit-input mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="cockpit-label">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={newSandboxDescription}
                onChange={(e) => setNewSandboxDescription(e.target.value)}
                placeholder="Enter room description"
                className="cockpit-input mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="cockpit-lever"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSandbox}
              disabled={!newSandboxName.trim() || creating}
              className="cockpit-lever"
            >
              {creating ? 'Creating...' : 'Create Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

