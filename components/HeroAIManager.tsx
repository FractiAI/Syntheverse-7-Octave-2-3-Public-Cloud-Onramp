/**
 * HeroAIManager - Interactive AI Guide with Personality
 * Dynamically loads hero character and system prompt from database
 * Each page gets its own hero guide (Humboldt, Turing, Leonardo, Tesla, Fuller)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HeroData {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  role: string;
  default_system_prompt: string;
  metadata: any;
}

interface HeroAIManagerProps {
  pageContext: 'onboarding' | 'fractiai' | 'dashboard' | 'operator' | 'creator';
  moduleTitle?: string;
  moduleNumber?: number;
  additionalContext?: string;
}

export function HeroAIManager({ 
  pageContext,
  moduleTitle,
  moduleNumber,
  additionalContext
}: HeroAIManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Fetch hero data on mount
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const response = await fetch(`/api/heroes/by-page?page=${pageContext}`);
        if (response.ok) {
          const data = await response.json();
          setHeroData(data);
        }
      } catch (error) {
        console.error('Error fetching hero:', error);
      } finally {
        setHeroLoading(false);
      }
    };

    fetchHero();
  }, [pageContext]);

  // Add welcome message when opened for first time
  useEffect(() => {
    if (isOpen && messages.length === 0 && heroData) {
      const contextText = moduleTitle 
        ? `for **${moduleTitle}**${moduleNumber ? ` (Module ${moduleNumber})` : ''}` 
        : 'for this section';
      
      setMessages([{
        role: 'assistant',
        content: `${heroData.icon} Greetings! I am **${heroData.name}**, ${heroData.tagline}.

I'm here to guide you ${contextText}. Feel free to ask me:

• Questions about concepts or ideas
• Help understanding how things work
• Guidance on next steps
• Clarification on anything unclear

What would you like to explore?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length, heroData, moduleTitle, moduleNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !heroData) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/hero-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          heroId: heroData.id,
          pageContext,
          moduleTitle,
          moduleNumber,
          additionalContext: additionalContext?.substring(0, 2000)
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (heroLoading || !heroData) {
    return null; // Or show a loading state
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/50 rounded-lg transition-all"
          style={{
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          }}
        >
          <MessageCircle className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">
            Ask {heroData.name}
          </span>
          <span className="text-lg">{heroData.icon}</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-4 right-4 w-full max-w-md bg-[var(--space-deep)] border border-[var(--keyline-primary)] rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{
            maxHeight: 'calc(100vh - 100px)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)',
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b border-[var(--keyline-primary)]"
            style={{
              background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{heroData.icon}</div>
              <div>
                <div className="font-semibold text-sm text-purple-300">
                  {heroData.name}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {heroData.tagline}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[var(--space-deep)] rounded transition-colors"
            >
              <X className="h-5 w-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100'
                      : 'bg-blue-600/10 border border-blue-500/20 text-blue-100'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />')
                    }}
                  />
                  <div className="text-xs opacity-50 mt-1">
                    {msg.timestamp.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-sm text-blue-300">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[var(--keyline-primary)]">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${heroData.name}...`}
                className="flex-1 px-3 py-2 bg-[var(--space-darkest)] border border-[var(--keyline-primary)] rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                rows={2}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white font-medium transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
            <div className="text-xs text-[var(--text-secondary)] mt-2">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      )}
    </>
  );
}

