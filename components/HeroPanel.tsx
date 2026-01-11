/**
 * Hero Panel - AI Chat Assistant Interface
 * 
 * Modern chat UI for hero host interactions
 * Features:
 * - ChatGPT-style conversational interface
 * - Collapsible panel with persistent state
 * - Hero selection dropdown
 * - Story-based conversation starters
 * - Smooth animations and typing indicators
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  MessageCircle, 
  Send,
  X,
  Sparkles,
  Book,
  User,
  Bot,
  Loader2,
  RotateCw,
  Settings
} from 'lucide-react';
import { PersistentDetails } from '@/components/PersistentDetails';
import { trackHeroInteraction, trackStorySelection, trackMessageSent } from '@/utils/hero-analytics';

interface Hero {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  role: string;
  metadata: any;
}

interface Story {
  id: string;
  title: string;
  description: string;
  category: string;
  metadata: any;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface HeroPanelProps {
  pageContext?: string;
  pillarContext?: string;
  userEmail: string;
}

export function HeroPanel({ pageContext = 'landing', pillarContext = 'contributor', userEmail }: HeroPanelProps) {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [showStories, setShowStories] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load heroes on mount
  useEffect(() => {
    loadHeroes();
  }, [pageContext, pillarContext]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHeroes = async () => {
    try {
      const params = new URLSearchParams({
        page: pageContext,
        pillar: pillarContext,
        status: 'active',
      });
      
      const response = await fetch(`/api/heroes?${params}`);
      const data = await response.json();
      
      if (data.heroes && Array.isArray(data.heroes)) {
        setHeroes(data.heroes);
        
        // Auto-select first hero if available
        if (data.heroes.length > 0 && !selectedHero) {
          const firstHero = data.heroes[0];
          setSelectedHero(firstHero);
          loadStories(firstHero.id);
          initializeChat(firstHero);
        }
      }
    } catch (error) {
      console.error('[HeroPanel] Error loading heroes:', error);
    }
  };

  const loadStories = async (heroId: string) => {
    try {
      const response = await fetch(`/api/heroes/${heroId}/stories`);
      const data = await response.json();
      
      if (data.stories && Array.isArray(data.stories)) {
        setStories(data.stories);
      }
    } catch (error) {
      console.error('[HeroPanel] Error loading stories:', error);
    }
  };

  const initializeChat = (hero: Hero) => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Hi! I'm ${hero.name}. ${hero.tagline} How can I help you today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
    
    // Create session
    createSession(hero.id);
  };

  const createSession = async (heroId: string, storyId?: string) => {
    try {
      const response = await fetch('/api/hero-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_id: heroId,
          story_id: storyId,
          user_email: userEmail,
          context: { pageContext, pillarContext },
        }),
      });
      
      const data = await response.json();
      if (data.session_id) {
        setSessionId(data.session_id);
      }
    } catch (error) {
      console.error('[HeroPanel] Error creating session:', error);
    }
  };

  const handleHeroChange = (hero: Hero) => {
    setSelectedHero(hero);
    loadStories(hero.id);
    setMessages([]);
    initializeChat(hero);
    
    trackHeroInteraction({
      hero_id: hero.id,
      event_type: 'hero_viewed',
      event_metadata: {
        heroName: hero.name,
        pageContext,
        pillarContext,
      },
    });
  };

  const handleStorySelect = async (story: Story) => {
    setShowStories(false);
    
    const storyMessage: Message = {
      role: 'assistant',
      content: `Great! Let's explore "${story.title}". ${story.description}`,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, storyMessage]);
    createSession(selectedHero!.id, story.id);
    
    trackStorySelection(selectedHero!.id, story.id, sessionId);
    
    // Focus input after story selection
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    if (selectedHero && sessionId) {
      trackMessageSent(selectedHero.id, sessionId);
    }

    try {
      // Simulate AI response (replace with actual API call to your AI service)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: `I understand you said: "${userMessage.content}". I'm here to help! (Connect this to your AI service for real responses)`,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[HeroPanel] Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (selectedHero) {
      setMessages([]);
      setSessionId(null);
      initializeChat(selectedHero);
    }
  };

  return (
    <PersistentDetails storageKey="hero-chat-panel" defaultOpen={false} className="cockpit-panel mb-6">
      <summary className="cursor-pointer select-none list-none p-4 border-b border-[var(--keyline-primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[var(--hydrogen-alpha)] to-[var(--hydrogen-beta)]">
              {selectedHero ? (
                <span className="text-xl">{selectedHero.icon}</span>
              ) : (
                <Bot className="h-5 w-5 text-black" />
              )}
            </div>
            <div>
              <div className="cockpit-label text-sm font-semibold">
                {selectedHero ? selectedHero.name : 'AI Guide'}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                {selectedHero ? selectedHero.tagline : `${heroes.length} assistant${heroes.length !== 1 ? 's' : ''} available`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <span className="text-xs text-[var(--hydrogen-alpha)] font-medium">
                {messages.filter(m => m.role !== 'system').length} messages
              </span>
            )}
            <ChevronDown className="cockpit-chevron h-5 w-5 opacity-70" />
          </div>
        </div>
      </summary>
      
      <div className="flex flex-col h-[600px] bg-gradient-to-b from-transparent to-[var(--cockpit-panel-bg)]">
        {/* Chat Header with Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--keyline-primary)] bg-[var(--cockpit-black)]">
          <div className="flex items-center gap-2">
            {/* Hero Selector Dropdown */}
            <select
              value={selectedHero?.id || ''}
              onChange={(e) => {
                const hero = heroes.find(h => h.id === e.target.value);
                if (hero) handleHeroChange(hero);
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--cockpit-panel-bg)] border border-[var(--keyline-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--hydrogen-alpha)] cursor-pointer"
            >
              {heroes.map(hero => (
                <option key={hero.id} value={hero.id}>
                  {hero.icon} {hero.name}
                </option>
              ))}
            </select>
            
            {/* Story Browser Toggle */}
            {stories.length > 0 && (
              <button
                onClick={() => setShowStories(!showStories)}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                  showStories
                    ? 'bg-[var(--hydrogen-alpha)] text-black'
                    : 'bg-[var(--cockpit-panel-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--keyline-primary)]'
                }`}
              >
                <Book className="h-3 w-3" />
                Topics ({stories.length})
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              className="p-1.5 rounded hover:bg-[var(--cockpit-panel-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              title="New conversation"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Story Browser (when toggled) */}
          {showStories && stories.length > 0 && (
            <div className="mb-4 p-4 rounded-lg bg-[var(--cockpit-panel-bg)] border border-[var(--keyline-primary)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-[var(--hydrogen-alpha)]">
                  Conversation Topics
                </h3>
                <button
                  onClick={() => setShowStories(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {stories.map((story) => (
                  <button
                    key={story.id}
                    onClick={() => handleStorySelect(story)}
                    className="w-full text-left p-3 rounded-lg bg-[var(--cockpit-black)] hover:bg-[var(--cockpit-bg)] border border-[var(--keyline-primary)] hover:border-[var(--hydrogen-alpha)] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--hydrogen-alpha)] mb-1">
                          {story.title}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {story.description}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--hydrogen-alpha)]/10 text-[var(--hydrogen-alpha)] font-medium">
                        {story.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.length === 0 && !showStories && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--hydrogen-alpha)] to-[var(--hydrogen-beta)] flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md">
                Ask me anything or explore conversation topics to get started.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} ${
                message.role === 'system' ? 'justify-center' : ''
              }`}
            >
              {message.role !== 'system' && (
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-[var(--cockpit-panel-bg)]'
                    : 'bg-gradient-to-br from-[var(--hydrogen-alpha)] to-[var(--hydrogen-beta)]'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-[var(--text-primary)]" />
                  ) : (
                    <span className="text-sm">{selectedHero?.icon || '🤖'}</span>
                  )}
                </div>
              )}
              
              <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} ${
                message.role === 'system' ? 'items-center' : ''
              } max-w-[80%]`}>
                {message.role !== 'system' && (
                  <div className="text-[10px] text-[var(--text-secondary)] mb-1 px-1">
                    {message.role === 'user' ? 'You' : selectedHero?.name}
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-[var(--hydrogen-alpha)] text-black rounded-tr-sm'
                    : message.role === 'assistant'
                    ? 'bg-[var(--cockpit-panel-bg)] text-[var(--text-primary)] border border-[var(--keyline-primary)] rounded-tl-sm'
                    : 'bg-[var(--cockpit-panel-bg)]/50 text-[var(--text-secondary)] text-xs italic'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--hydrogen-alpha)] to-[var(--hydrogen-beta)] flex items-center justify-center">
                <span className="text-sm">{selectedHero?.icon || '🤖'}</span>
              </div>
              <div className="flex flex-col items-start">
                <div className="text-[10px] text-[var(--text-secondary)] mb-1 px-1">
                  {selectedHero?.name}
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-[var(--cockpit-panel-bg)] border border-[var(--keyline-primary)]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-[var(--hydrogen-alpha)] animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--hydrogen-alpha)] animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-[var(--hydrogen-alpha)] animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[var(--keyline-primary)] p-4 bg-[var(--cockpit-black)]">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder={`Message ${selectedHero?.name || 'AI Assistant'}...`}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--cockpit-panel-bg)] border border-[var(--keyline-primary)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--hydrogen-alpha)] disabled:opacity-50 transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--hydrogen-alpha)] hover:bg-[var(--hydrogen-beta)] disabled:bg-[var(--cockpit-panel-bg)] disabled:opacity-50 text-black disabled:text-[var(--text-secondary)] flex items-center justify-center transition-all disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Quick hint */}
          <div className="mt-2 text-[10px] text-[var(--text-secondary)] text-center">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </PersistentDetails>
  );
}
