/**
 * System Broadcast Center
 * Creator/Operator interface for managing system broadcast messages
 * These messages appear as dismissible banners in the contributor dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { Radio, Plus, Edit, Trash2, Save, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// Select component not available, using native select instead

type MessageNature =
  | 'announcement'
  | 'warning'
  | 'info'
  | 'success'
  | 'milestone'
  | 'alert'
  | 'update';

interface Broadcast {
  id: string;
  message: string;
  nature: MessageNature;
  is_active: boolean;
  created_by: string;
  created_at: string;
  expires_at: string | null;
}

export function SystemBroadcastCenter() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    nature: 'info' as MessageNature,
    expires_at: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    try {
      const response = await fetch('/api/broadcasts/all');
      if (response.ok) {
        const data = await response.json();
        setBroadcasts(data.broadcasts || []);
      }
    } catch (err) {
      console.error('Failed to load broadcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.message.trim()) {
      setError('Message is required');
      return;
    }

    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: formData.message,
          nature: formData.nature,
          expires_at: formData.expires_at || null,
        }),
      });

      if (response.ok) {
        setShowCreateDialog(false);
        setFormData({ message: '', nature: 'info', expires_at: '' });
        setError(null);
        await loadBroadcasts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create broadcast');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create broadcast');
    }
  };

  const handleUpdate = async (id: string) => {
    const broadcast = broadcasts.find((b) => b.id === id);
    if (!broadcast) return;

    try {
      const response = await fetch(`/api/broadcasts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: formData.message || broadcast.message,
          nature: formData.nature || broadcast.nature,
          expires_at: formData.expires_at || broadcast.expires_at,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        setFormData({ message: '', nature: 'info', expires_at: '' });
        setError(null);
        await loadBroadcasts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update broadcast');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update broadcast');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/broadcasts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteId(null);
        await loadBroadcasts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete broadcast');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete broadcast');
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/broadcasts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: !currentActive,
        }),
      });

      if (response.ok) {
        await loadBroadcasts();
      }
    } catch (err) {
      console.error('Failed to toggle broadcast:', err);
    }
  };

  const startEdit = (broadcast: Broadcast) => {
    setEditingId(broadcast.id);
    setFormData({
      message: broadcast.message,
      nature: broadcast.nature,
      expires_at: broadcast.expires_at
        ? new Date(broadcast.expires_at).toISOString().split('T')[0]
        : '',
    });
    setError(null);
  };

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text opacity-60">Loading broadcasts...</div>
      </div>
    );
  }

  return (
    <>
      <div className="cockpit-panel border-l-4 border-purple-500 p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="cockpit-label mb-2 flex items-center gap-2">
              <Radio className="h-4 w-4 text-purple-400" />
              SYSTEM BROADCAST CENTER
            </div>
            <h2 className="cockpit-title mb-2 text-xl">Broadcast Message Management</h2>
            <p className="cockpit-text text-sm opacity-80">
              Create and manage system broadcast messages that appear as dismissible banners in the
              contributor dashboard. Messages can be set to expire automatically.
            </p>
          </div>
          <Button
            onClick={() => {
              setShowCreateDialog(true);
              setFormData({ message: '', nature: 'info', expires_at: '' });
              setError(null);
            }}
            className="cockpit-lever"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Broadcast
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 p-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {broadcasts.length === 0 ? (
            <div className="cockpit-panel bg-[var(--cockpit-carbon)] p-6 text-center">
              <div className="cockpit-text opacity-60">No broadcasts created yet.</div>
            </div>
          ) : (
            broadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className={`cockpit-panel flex items-start justify-between bg-[var(--cockpit-carbon)] p-4 ${
                  !broadcast.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`cockpit-label rounded px-2 py-1 text-xs ${
                        broadcast.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {broadcast.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <span className="cockpit-label rounded px-2 py-1 text-xs bg-purple-500/20 text-purple-400">
                      {broadcast.nature.toUpperCase()}
                    </span>
                    {broadcast.expires_at && (
                      <span className="cockpit-text text-xs opacity-60">
                        Expires: {new Date(broadcast.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="cockpit-text mb-1">{broadcast.message}</div>
                  <div className="cockpit-text text-xs opacity-60">
                    Created by {broadcast.created_by} on{' '}
                    {new Date(broadcast.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(broadcast.id, broadcast.is_active)}
                    className="cockpit-lever"
                  >
                    {broadcast.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(broadcast)}
                    className="cockpit-lever"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(broadcast.id)}
                    className="cockpit-lever bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="cockpit-panel border-purple-500">
          <DialogHeader>
            <DialogTitle className="cockpit-title">Create New Broadcast</DialogTitle>
            <DialogDescription className="cockpit-text">
              Create a new system broadcast message that will appear in the contributor dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="message" className="cockpit-label">
                Message
              </Label>
              <Input
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter broadcast message..."
                className="cockpit-input mt-2"
              />
            </div>

            <div>
              <Label htmlFor="nature" className="cockpit-label">
                Message Type
              </Label>
              <select
                id="nature"
                value={formData.nature}
                onChange={(e) =>
                  setFormData({ ...formData, nature: e.target.value as MessageNature })
                }
                className="cockpit-input mt-2 w-full"
              >
                <option value="announcement">Announcement</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="milestone">Milestone</option>
                <option value="alert">Alert</option>
                <option value="update">Update</option>
              </select>
            </div>

            <div>
              <Label htmlFor="expires_at" className="cockpit-label">
                Expiration Date (Optional)
              </Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="cockpit-input mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="cockpit-lever">
              <Save className="mr-2 h-4 w-4" />
              Create Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="cockpit-panel border-purple-500">
          <DialogHeader>
            <DialogTitle className="cockpit-title">Edit Broadcast</DialogTitle>
            <DialogDescription className="cockpit-text">
              Update the broadcast message and settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-message" className="cockpit-label">
                Message
              </Label>
              <Input
                id="edit-message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="cockpit-input mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-nature" className="cockpit-label">
                Message Type
              </Label>
              <select
                id="edit-nature"
                value={formData.nature}
                onChange={(e) =>
                  setFormData({ ...formData, nature: e.target.value as MessageNature })
                }
                className="cockpit-input mt-2 w-full"
              >
                <option value="announcement">Announcement</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="milestone">Milestone</option>
                <option value="alert">Alert</option>
                <option value="update">Update</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit-expires_at" className="cockpit-label">
                Expiration Date (Optional)
              </Label>
              <Input
                id="edit-expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="cockpit-input mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingId && handleUpdate(editingId)}
              className="cockpit-lever"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="cockpit-panel border-red-500">
          <DialogHeader>
            <DialogTitle className="cockpit-title flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="cockpit-text">
              Are you sure you want to delete this broadcast? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

