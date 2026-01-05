'use client';

import { useState, useEffect } from 'react';
import { Users, Trash2, Shield, ShieldOff, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  deleted_at: string | null;
  contribution_count: number;
  sandbox_count: number;
  on_chain_count: number;
  last_activity: string | null;
  is_creator: boolean;
}

interface UserListResponse {
  users: User[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function CreatorUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteMode, setDeleteMode] = useState<{ email: string; mode: 'hard' | null }>({
    email: '',
    mode: null,
  });
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [roleAction, setRoleAction] = useState<{ email: string; action: 'grant' | 'revoke' | null }>({
    email: '',
    action: null,
  });
  const [managingRole, setManagingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/creator/users');
      if (response.ok) {
        const data: UserListResponse = await response.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (email: string) => {
    setDeleteMode({ email, mode: 'hard' });
    setConfirmationPhrase('');
    setSafetyConfirmed(false);
    setError(null);
  };

  const confirmDelete = async () => {
    if (!deleteMode.email || !deleteMode.mode || !safetyConfirmed) return;

    const requiredPhrase = 'DELETE USER';
    if (confirmationPhrase !== requiredPhrase) {
      setError(`Confirmation phrase must be exactly: ${requiredPhrase}`);
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/creator/users/${encodeURIComponent(deleteMode.email)}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'hard',
          confirmation_phrase: confirmationPhrase,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDeleteMode({ email: '', mode: null });
        setConfirmationPhrase('');
        setSafetyConfirmed(false);
        await loadUsers();
        alert(`User deleted successfully.`);
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleChange = async (email: string, action: 'grant' | 'revoke') => {
    setRoleAction({ email, action });
    setManagingRole(true);
    setError(null);

    try {
      const response = await fetch(`/api/creator/users/${encodeURIComponent(email)}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          role: 'operator',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadUsers();
        alert(`Operator role ${action === 'grant' ? 'granted' : 'revoked'} successfully.`);
      } else {
        setError(data.error || `Failed to ${action} operator role`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} operator role`);
    } finally {
      setManagingRole(false);
      setRoleAction({ email: '', action: null });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="cockpit-panel p-6">
        <div className="cockpit-text">Loading users...</div>
      </div>
    );
  }

  const targetUser = deleteMode.email ? users.find((u) => u.email === deleteMode.email) : null;

  return (
    <>
      <div className="cockpit-panel p-6 border-l-4 border-red-500">
        <div className="flex items-start gap-3 mb-4">
          <Users className="h-6 w-6 text-red-500" />
          <div className="flex-1">
            <div className="cockpit-label mb-2">USER MANAGEMENT</div>
            <h2 className="cockpit-title text-xl mb-2">User Administration</h2>
            <p className="cockpit-text text-sm opacity-80">
              Manage users, delete accounts, and grant/revoke operator privileges. All actions are
              logged.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cockpit-input pl-10"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="cockpit-panel p-4 bg-[var(--cockpit-carbon)] flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="cockpit-title">{user.name}</span>
                  <Badge
                    variant={
                      user.role === 'creator'
                        ? 'default'
                        : user.role === 'operator'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="text-xs"
                  >
                    {user.role}
                  </Badge>
                  {user.deleted_at && (
                    <Badge variant="destructive" className="text-xs">
                      Deleted
                    </Badge>
                  )}
                </div>
                <div className="cockpit-text text-sm opacity-80">{user.email}</div>
                <div className="cockpit-text text-xs opacity-60 mt-1">
                  {user.contribution_count} contributions • {user.sandbox_count} sandboxes •{' '}
                  {user.on_chain_count} on-chain • Last: {user.last_activity ? new Date(user.last_activity).toLocaleDateString() : 'Never'}
                </div>
              </div>
              <div className="flex gap-2">
                {!user.is_creator && (
                  <>
                    {user.role === 'operator' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange(user.email, 'revoke')}
                        disabled={managingRole}
                        className="cockpit-lever"
                      >
                        <ShieldOff className="h-3 w-3 mr-1" />
                        Revoke Operator
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRoleChange(user.email, 'grant')}
                        disabled={managingRole}
                        className="cockpit-lever"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Grant Operator
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(user.email)}
                      disabled={deleting}
                      className="cockpit-lever bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete User
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteMode.mode !== null} onOpenChange={() => setDeleteMode({ email: '', mode: null })}>
        <DialogContent className="cockpit-panel border-red-500">
          <DialogHeader>
            <DialogTitle className="cockpit-title flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm User Delete
            </DialogTitle>
            <DialogDescription className="cockpit-text">
              {targetUser && (
                <>
                  <div className="mb-2">
                    <strong>User:</strong> {targetUser.name} ({targetUser.email})
                  </div>
                  {targetUser.on_chain_count > 0 && (
                    <div className="text-amber-500 mb-2">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      This user has {targetUser.on_chain_count} on-chain PoC(s). On-chain records
                      will be preserved.
                    </div>
                  )}
                </>
              )}
              <strong className="text-red-500">WARNING:</strong> This will permanently remove the
              user account and anonymize their contributions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Safety Confirmation Button */}
            <div className="p-4 bg-red-500/10 border-2 border-red-500/50 rounded">
              <Label className="cockpit-label text-sm mb-2 block">
                Step 1: Confirm Safety Acknowledgment
              </Label>
              <Button
                onClick={() => setSafetyConfirmed(!safetyConfirmed)}
                variant={safetyConfirmed ? 'default' : 'outline'}
                className={`w-full ${
                  safetyConfirmed
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'border-red-500 text-red-400'
                }`}
              >
                {safetyConfirmed ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Safety Acknowledged
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Click to Acknowledge Safety Warning
                  </>
                )}
              </Button>
            </div>

            {/* Confirmation Phrase */}
            {safetyConfirmed && (
              <div>
                <Label htmlFor="delete-confirmation" className="cockpit-label">
                  Step 2: Type &quot;DELETE USER&quot; to confirm:
                </Label>
                <Input
                  id="delete-confirmation"
                  value={confirmationPhrase}
                  onChange={(e) => setConfirmationPhrase(e.target.value)}
                  placeholder="DELETE USER"
                  className="cockpit-input mt-2"
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteMode({ email: '', mode: null });
                setConfirmationPhrase('');
                setSafetyConfirmed(false);
                setError(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="destructive"
              disabled={deleting || !safetyConfirmed || confirmationPhrase !== 'DELETE USER'}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

