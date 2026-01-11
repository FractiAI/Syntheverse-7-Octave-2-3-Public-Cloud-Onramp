/**
 * Hero Panel - Collapsible hero host interaction interface
 * 
 * Consumer-facing component that displays at bottom of pages
 * Features:
 * - Collapsible/expandable
 * - Hero selection
 * - Story browser
 * - AI chat interface
 * - Read-only for consumers
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Book, 
  Sparkles,
  Send,
  X,
  Star,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trackHeroInteraction, trackStorySelection, trackMessageSent, trackHeroPanelVisibility } from '@/utils/hero-analytics';

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
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface HeroPanelProps {
  pageContext?: string; // e.g., 'landing', 'dashboard', 'onboarding'
  pillarContext?: string; // e.g., 'contributor', 'operator', 'creator'
  userEmail: string;
}

export function HeroPanel({ pageContext = 'landing', pillarContext = 'contributor', userEmail }: HeroPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeView, setActiveView] = useState<'heroes' | 'stories' | 'chat'>('heroes');
  
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      
      console.log('[HeroPanel] Loading heroes with params:', { page: pageContext, pillar: pillarContext });
      
      const response = await fetch(`/api/heroes?${params}`);
      const data = await response.json();
      
      console.log('[HeroPanel] Heroes API response:', data);
      
      if (data.success) {
        setHeroes(data.heroes);
        console.log('[HeroPanel] Loaded heroes:', data.heroes.length);
        
        // Auto-select default hero if available
        const defaultHero = data.heroes.find((h: Hero) => h.metadata?.is_default);
        if (defaultHero) {
          setSelectedHero(defaultHero);
          console.log('[HeroPanel] Selected default hero:', defaultHero.name);
        } else if (data.heroes.length > 0) {
          setSelectedHero(data.heroes[0]);
          console.log('[HeroPanel] Selected first hero:', data.heroes[0].name);
        }
      }
    } catch (error) {
      console.error('[HeroPanel] Error loading heroes:', error);
    }
  };

  const loadStories = async (heroId: string) => {
    try {
      const response = await fetch(`/api/heroes/${heroId}/stories?status=active`);
      const data = await response.json();
      
      if (data.success) {
        setStories(data.stories);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const startSession = async (storyId?: string) => {
    if (!selectedHero) return;

    try {
      const response = await fetch('/api/hero-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_id: selectedHero.id,
          story_id: storyId || null,
          session_type: storyId ? 'story' : 'free_chat',
          metadata: {
            page_context: pageContext,
            pillar_context: pillarContext,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.session.id);
        setActiveView('chat');
        
        // Add welcome message
        const welcomeMessage: Message = {
          role: 'assistant',
          content: `Hello! I'm ${selectedHero.name}. ${selectedHero.tagline}. How can I help you today?`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/hero-sessions/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Track message sent
        if (selectedHero && sessionId) {
          trackMessageSent(selectedHero.id, sessionId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeroSelect = (hero: Hero) => {
    setSelectedHero(hero);
    loadStories(hero.id);
    setActiveView('stories');
    
    // Track hero view
    trackHeroInteraction({
      hero_id: hero.id,
      event_type: 'hero_viewed',
    });
  };

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
    startSession(story.id);
    
    // Track story selection
    if (selectedHero) {
      trackStorySelection(selectedHero.id, story.id, sessionId || undefined);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setSessionId(null);
    setActiveView('heroes');
    setSelectedStory(null);
  };

  if (!isExpanded) {
    // Collapsed state - minimal bar (ALWAYS VISIBLE)
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[var(--hydrogen-alpha)] bg-[var(--cockpit-black)] shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => {
              setIsExpanded(true);
              if (selectedHero) {
                trackHeroPanelVisibility(selectedHero.id, true);
              }
            }}
            className="flex w-full items-center justify-between text-sm hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-3">
              {selectedHero ? (
                <>
                  <span className="text-2xl">{selectedHero.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-[var(--hydrogen-alpha)]">
                      {selectedHero.name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {selectedHero.tagline}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-[var(--hydrogen-alpha)]" />
                  <div className="text-left">
                    <div className="font-semibold text-[var(--hydrogen-alpha)]">
                      Hero Guide {heroes.length > 0 ? `(${heroes.length} available)` : '(Loading...)'}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {heroes.length > 0 ? 'Click to select a hero and interact' : 'Click to explore'}
                    </div>
                  </div>
                </>
              )}
            </div>
            <ChevronUp className="h-5 w-5 text-[var(--hydrogen-alpha)]" />
          </button>
        </div>
      </div>
    );
  }

  // Expanded state - full interface
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--keyline-primary)] bg-[var(--cockpit-black)] backdrop-blur-sm transition-all ${
        isFullscreen ? 'top-0' : 'max-h-[500px]'
      }`}
    >
      <div className="container mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--keyline-primary)]">
          <div className="flex items-center gap-3">
            {selectedHero && (
              <>
                <span className="text-2xl">{selectedHero.icon}</span>
                <div>
                  <div className="font-semibold text-[var(--hydrogen-alpha)]">
                    {selectedHero.name}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {selectedHero.tagline}
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Tabs */}
            <div className="flex gap-1 mr-4">
              <button
                onClick={() => setActiveView('heroes')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeView === 'heroes'
                    ? 'bg-[var(--hydrogen-alpha)] text-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sparkles className="h-3 w-3 inline mr-1" />
                Heroes
              </button>
              <button
                onClick={() => {
                  if (selectedHero) {
                    loadStories(selectedHero.id);
                    setActiveView('stories');
                  }
                }}
                disabled={!selectedHero}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeView === 'stories'
                    ? 'bg-[var(--hydrogen-alpha)] text-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30'
                }`}
              >
                <Book className="h-3 w-3 inline mr-1" />
                Stories
              </button>
              <button
                onClick={() => setActiveView('chat')}
                disabled={!sessionId}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeView === 'chat'
                    ? 'bg-[var(--hydrogen-alpha)] text-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30'
                }`}
              >
                <MessageCircle className="h-3 w-3 inline mr-1" />
                Chat
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-[var(--text-secondary)]"
            >
              {isFullscreen ? 'Minimize' : 'Fullscreen'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(false);
                if (selectedHero) {
                  trackHeroPanelVisibility(selectedHero.id, false);
                }
              }}
              className="text-[var(--text-secondary)]"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Heroes View */}
          {activeView === 'heroes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heroes.map((hero) => (
                <Card
                  key={hero.id}
                  className={`p-4 cursor-pointer hover:border-[var(--hydrogen-alpha)] transition-colors ${
                    selectedHero?.id === hero.id ? 'border-[var(--hydrogen-alpha)]' : ''
                  }`}
                  onClick={() => handleHeroSelect(hero)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{hero.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--text-primary)]">{hero.name}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mb-2">{hero.tagline}</p>
                      <Badge variant="outline" className="text-xs">
                        {hero.role}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Stories View */}
          {activeView === 'stories' && (
            <div className="space-y-4">
              {stories.length === 0 && (
                <div className="text-center py-8 text-[var(--text-secondary)]">
                  <Book className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No stories available yet</p>
                  <Button
                    onClick={() => startSession()}
                    className="mt-4"
                  >
                    Start Free Chat Instead
                  </Button>
                </div>
              )}
              
              {stories.map((story) => (
                <Card
                  key={story.id}
                  className="p-4 cursor-pointer hover:border-[var(--hydrogen-alpha)] transition-colors"
                  onClick={() => handleStorySelect(story)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                        {story.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-3">
                        {story.description}
                      </p>
                      <div className="flex gap-2">
                        {story.category && (
                          <Badge variant="outline" className="text-xs">
                            {story.category}
                          </Badge>
                        )}
                        {story.metadata?.difficulty_level && (
                          <Badge variant="outline" className="text-xs">
                            {story.metadata.difficulty_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Chat View */}
          {activeView === 'chat' && (
            <div className="flex flex-col h-full">
              {sessionId ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-[var(--hydrogen-alpha)] text-black'
                              : 'bg-[var(--cockpit-carbon)] text-[var(--text-primary)]'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[var(--cockpit-carbon)] rounded-lg px-4 py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 rounded bg-[var(--cockpit-carbon)] border border-[var(--keyline-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--hydrogen-alpha)]"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-[var(--hydrogen-alpha)] text-black hover:opacity-80"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={resetChat}
                      variant="outline"
                      className="text-[var(--text-secondary)]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50 text-[var(--text-secondary)]" />
                  <p className="text-[var(--text-secondary)] mb-4">
                    Select a story or start a free chat
                  </p>
                  <Button onClick={() => startSession()}>
                    Start Chat with {selectedHero?.name}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

