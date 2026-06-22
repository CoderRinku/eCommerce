'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  ChevronDown, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { text: 'শিপিং চার্জ কত?', label: 'শিপিং চার্জ' },
  { text: 'অর্ডার কীভাবে করব?', label: 'অর্ডার করার নিয়ম' },
  { text: 'আপনাদের সেরা প্রোডাক্টগুলো কী?', label: 'সেরা প্রোডাক্ট' },
  { text: 'পেমেন্ট পদ্ধতি কী কী?', label: 'পেমেন্ট মাধ্যম' },
];

export function AIChatWidget() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  // Don't show public chatbot on admin pages
  const isAdminPage = pathname?.startsWith('/admin');

  // Load chat history from localStorage
  useEffect(() => {
    if (isAdminPage) return;
    try {
      const saved = localStorage.getItem('sokolbazar_ai_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const hydrated = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(hydrated);
      }
    } catch (e) {
      console.error('Failed to load chat history from localStorage:', e);
    }
  }, [isAdminPage]);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('sokolbazar_ai_chat', JSON.stringify(messages));
    } else {
      localStorage.removeItem('sokolbazar_ai_chat');
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Alert notification for new messages if the chat window is closed
  useEffect(() => {
    if (messages.length > 0 && !isOpen) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setHasNewMessage(true);
      }
    }
  }, [messages, isOpen]);

  if (isAdminPage) return null;

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('আপনি কি চ্যাট হিস্ট্রি মুছে ফেলতে চান?')) {
      setMessages([]);
      setError(null);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    setError(null);
    setInput('');
    setIsLoading(true);

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      // Map message history to format expected by API
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        throw new Error('API Route execution failed');
      }

      const data = await res.json();
      
      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('দুঃখিত, সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  // Helper to parse simple markdown bold and links in the message
  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      let remaining = line;
      const elements: React.ReactNode[] = [];
      let keyIndex = 0;

      // Pattern matches **bold** or [label](url)
      const tokenRegex = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
      let match;
      let lastIndex = 0;

      while ((match = tokenRegex.exec(remaining)) !== null) {
        if (match.index > lastIndex) {
          elements.push(remaining.substring(lastIndex, match.index));
        }

        if (match[2]) {
          elements.push(
            <strong key={`b-${keyIndex++}`} className="font-bold text-neutral-900">
              {match[2]}
            </strong>
          );
        } else if (match[3] && match[4]) {
          const label = match[3];
          const url = match[4];
          const isExternal = url.startsWith('http');
          
          elements.push(
            <a
              key={`l-${keyIndex++}`}
              href={url}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-0.5 text-orange-600 hover:text-orange-700 underline font-semibold transition-colors bg-orange-50 px-1.5 py-0.5 rounded hover:bg-orange-100/70"
            >
              {label}
              <ArrowRight className="h-3 w-3 inline" />
            </a>
          );
        }

        lastIndex = tokenRegex.lastIndex;
      }

      if (lastIndex < remaining.length) {
        elements.push(remaining.substring(lastIndex));
      }

      // Check if line is a bullet point
      const isBullet = line.trim().startsWith('-');
      if (isBullet) {
        // Strip out the dash for display
        const bulletText = elements.length > 0 ? elements : line.substring(1).trim();
        return (
          <li key={idx} className="list-disc list-inside ml-2 leading-relaxed mb-1 text-sm text-neutral-700">
            {bulletText}
          </li>
        );
      }

      return (
        <p key={idx} className="leading-relaxed mb-1.5 text-sm text-neutral-700">
          {elements.length > 0 ? elements : line}
        </p>
      );
    });
  };

  const getGreeting = () => {
    const name = session?.user?.name ? `, ${session.user.name}` : '';
    return `আসসালামু আলাইকুম${name}! সকালবাজার AI অ্যাসিস্ট্যান্ট চ্যাটে আপনাকে স্বাগতম। আমরা ১০০% খাঁটি ও অর্গানিক গ্রোসারি সরাসরি কৃষকের কাছ থেকে সরবরাহ করি। আজ আপনাকে কীভাবে সাহায্য করতে পারি?`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Chat Window Panel */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border border-neutral-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-amber-100 animate-pulse" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-wide">সকালবাজার AI সহকারী</h4>
                <p className="text-[10px] text-orange-100 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-emerald-300 rounded-full" />
                  Online | Active now
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button 
                  onClick={handleClearChat}
                  title="চ্যাট হিস্ট্রি মুছুন"
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-orange-100 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button 
                onClick={handleOpenToggle}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-orange-100 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50">
            {messages.length === 0 ? (
              // Initial Welcome State
              <div className="flex flex-col items-center justify-center text-center h-full space-y-4 px-2 py-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100">
                  <HelpCircle className="h-6 w-6 text-orange-500" />
                </div>
                <div className="space-y-1.5">
                  <h5 className="font-semibold text-neutral-800 text-sm">আমাদের প্রশ্ন করুন!</h5>
                  <p className="text-xs text-neutral-500 max-w-[280px] leading-relaxed">
                    {getGreeting()}
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="grid grid-cols-2 gap-2 w-full pt-2">
                  {QUICK_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p.text)}
                      className="p-2.5 text-left text-xs bg-white border border-neutral-100 rounded-xl hover:border-orange-250 hover:bg-orange-50/20 text-neutral-700 hover:text-orange-600 transition-all font-medium cursor-pointer shadow-sm shadow-neutral-100/50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Message List
              <div className="space-y-3.5">
                {messages.map((m) => (
                  <div 
                    key={m.id}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                        m.role === 'user'
                          ? 'bg-orange-600 text-white rounded-tr-none'
                          : 'bg-white border border-neutral-105 text-neutral-800 rounded-tl-none'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <p className="leading-relaxed">{m.content}</p>
                      ) : (
                        renderMessageContent(m.content)
                      )}
                    </div>
                    <span className="text-[9px] text-neutral-450 mt-1 px-1 flex items-center gap-1">
                      <Clock className="h-2 w-2" />
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex flex-col items-start">
                    <div className="bg-white border border-neutral-105 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl p-3 text-xs text-center font-medium">
                    {error}
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Quick reply bar (only if we have messages already) */}
          {messages.length > 0 && !isLoading && (
            <div className="px-3 py-1.5 bg-neutral-50/50 border-t border-neutral-100 overflow-x-auto flex gap-1.5 whitespace-nowrap scrollbar-none">
              {QUICK_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.text)}
                  className="px-3 py-1 text-[11px] bg-white border border-neutral-150 rounded-full text-neutral-600 hover:text-orange-600 hover:border-orange-500 transition-all font-medium cursor-pointer shadow-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer Form */}
          <form 
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="আপনার প্রশ্ন লিখুন..."
              disabled={isLoading}
              className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:bg-white transition-all disabled:opacity-50 text-neutral-800"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-orange-600 hover:bg-orange-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:hover:bg-orange-600 cursor-pointer shadow-md shadow-orange-600/10"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Branding footer */}
          <div className="bg-neutral-50 text-[9px] text-neutral-400 py-1 text-center border-t border-neutral-50">
            Powered by Gemini 1.5 Flash • SokolBazar
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleOpenToggle}
        className={`relative w-14 h-14 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg shadow-orange-600/30 hover:scale-105 cursor-pointer select-none group`}
      >
        {isOpen ? (
          <ChevronDown className="h-6 w-6 transition-transform duration-300" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6" />
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[8px] font-bold text-white items-center justify-center">1</span>
              </span>
            )}
          </>
        )}
        
        {/* Subtle pulsation wave background */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-orange-600/20 animate-ping -z-10" />
        )}
      </button>
    </div>
  );
}
