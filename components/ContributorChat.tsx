'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChatMessage {
  id: string;
  contributor_email: string;
  operator_email: string | null;
  message: string;
  sender_role: 'contributor' | 'operator' | 'creator';
  read: boolean;
  created_at: string;
}

export function ContributorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/chat/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/chat/messages', {
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

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="cockpit-lever inline-block"
        variant="outline"
      >
        <MessageCircle className="mr-2 inline h-4 w-4" />
        Chat with Operator
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="cockpit-panel flex h-[600px] max-w-2xl flex-col border-[var(--keyline-primary)] p-0">
          <DialogHeader className="border-b border-[var(--keyline-primary)] p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="cockpit-title">Chat with Operator</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="cockpit-text flex h-full items-center justify-center text-center opacity-60">
                <div>
                  <MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-40" />
                  <p>No messages yet. Start a conversation!</p>
                </div>
              </div>
            ) : (
              messages
                .slice()
                .reverse()
                .map((msg) => {
                  const isContributor = msg.sender_role === 'contributor';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isContributor ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          isContributor
                            ? 'bg-[var(--hydrogen-amber)]/20 border border-[var(--hydrogen-amber)]/30'
                            : 'bg-[var(--cockpit-carbon)] border border-[var(--keyline-primary)]'
                        }`}
                      >
                        <div className="cockpit-label mb-1 text-xs opacity-75">
                          {isContributor
                            ? 'You'
                            : msg.sender_role === 'creator'
                              ? 'Creator'
                              : 'Operator'}
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
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

