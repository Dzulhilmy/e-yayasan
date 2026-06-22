'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Paperclip, Smile, Menu, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Session {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export default function AIAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [isTyping, setIsTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    // Load sessions from localStorage
    const saved = localStorage.getItem('eyp_ai_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id); // Load most recent
        } else {
          createNewSession();
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
        createNewSession();
      }
    } else {
      // Migrate old single history if exists
      const oldHistory = localStorage.getItem('eyp_ai_history');
      if (oldHistory) {
         try {
           const parsedMsgs = JSON.parse(oldHistory);
           const migratedSession = {
             id: Date.now().toString(),
             title: 'Chat Terdahulu',
             messages: parsedMsgs,
             updatedAt: Date.now()
           };
           setSessions([migratedSession]);
           setActiveSessionId(migratedSession.id);
         } catch(e) {
           createNewSession();
         }
      } else {
         createNewSession();
      }
    }

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createNewSession = () => {
    const newSession: Session = {
      id: Date.now().toString(),
      title: 'Perbualan Baru',
      messages: [{
        role: 'assistant',
        content: 'Hai! Saya asisten digital e-YP. Ada apa yang boleh saya bantu hari ini?',
        timestamp: Date.now()
      }],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setShowSidebar(false);
  };

  useEffect(() => {
    if (mounted && sessions.length > 0) {
      localStorage.setItem('eyp_ai_sessions', JSON.stringify(sessions));
    }
  }, [sessions, mounted]);

  useEffect(() => {
    if (isOpen && !showSidebar) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [sessions, activeSessionId, isOpen, showSidebar]);

  // Hide on login/signup pages
  if (pathname === '/login' || pathname === '/signup') return null;

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const updateSession = (id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s).sort((a,b) => b.updatedAt - a.updatedAt));
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Adakah anda pasti mahu memadam perbualan ini?')) {
      setSessions(prev => {
        const filtered = prev.filter(s => s.id !== id);
        if (filtered.length === 0) {
          const newSession: Session = {
            id: Date.now().toString(),
            title: 'Perbualan Baru',
            messages: [{
              role: 'assistant',
              content: 'Hai! Saya asisten digital e-YP. Ada apa yang boleh saya bantu hari ini?',
              timestamp: Date.now()
            }],
            updatedAt: Date.now()
          };
          setActiveSessionId(newSession.id);
          return [newSession];
        } else if (id === activeSessionId) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !activeSession) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
    
    // Auto-generate title if it's the first user message
    let newTitle = activeSession.title;
    if (activeSession.messages.length === 1 && activeSession.title === 'Perbualan Baru') {
       newTitle = input.substring(0, 25) + (input.length > 25 ? '...' : '');
    }

    const updatedMessages = [...messages, userMsg];
    updateSession(activeSession.id, { messages: updatedMessages, title: newTitle, updatedAt: Date.now() });
    
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const assistantMsg: Message = {
        role: 'assistant',
        content: generateResponse(input),
        timestamp: Date.now()
      };
      
      const finalMessages = [...updatedMessages, assistantMsg];
      updateSession(activeSession.id, { messages: finalMessages, updatedAt: Date.now() });
      setIsTyping(false);
    }, 1200);
  };

  const generateResponse = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('halo') || lower.includes('hai')) return 'Halo! Bagaimana kabar Anda hari ini?';
    if (lower.includes('bantuan') || lower.includes('mohon')) return 'Anda boleh memohon bantuan melalui menu "Mohon Bantuan" di dashboard.';
    if (lower.includes('status')) return 'Sila semak status permohonan anda di Dashboard utama.';
    return 'Maaf, saya masih belajar. Bolehkah anda jelaskan lebih lanjut?';
  };

  return (
    <motion.div 
      className="ai-container"
      drag={mounted}
      dragConstraints={{ 
        left: -windowSize.width + 100, 
        right: 0, 
        top: -windowSize.height + 500, 
        bottom: 0 
      }}
      dragElastic={0.1}
      dragMomentum={false}
      style={{ touchAction: 'none', visibility: mounted ? 'visible' : 'hidden' }}
    >
      <AnimatePresence>
        {isOpen && mounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="ai-chat-window"
          >
            {/* WhatsApp Style Header */}
            <div className="ai-header" style={{ cursor: 'move' }}>
              <div className="ai-header-profile">
                <div className="ai-header-avatar">
                  <Bot size={24} />
                </div>
                <div className="ai-header-info">
                  <h4>e-YP Assistant</h4>
                  <div className="online-status">
                    <span className="dot" /> {showSidebar ? 'Sejarah Sembang' : 'Online'}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setShowSidebar(!showSidebar)} className={`icon-btn ${showSidebar ? 'active-icon' : ''}`} title="Sejarah">
                  <Menu size={20} />
                </button>
                <button onClick={() => setIsOpen(false)} className="icon-btn">
                  <X size={20} />
                </button>
              </div>
            </div>

            {showSidebar ? (
              <div className="ai-sidebar">
                <button className="new-chat-btn" onClick={createNewSession}>
                  <Plus size={18} /> Perbualan Baru
                </button>
                <div className="sessions-list">
                  {sessions.map(s => (
                    <div 
                      key={s.id} 
                      className={`session-item ${s.id === activeSessionId ? 'active' : ''}`}
                      onClick={() => { setActiveSessionId(s.id); setShowSidebar(false); }}
                    >
                      <MessageSquare size={16} />
                      <div className="session-info">
                        <div className="session-title">{s.title}</div>
                        <div className="session-date">{new Date(s.updatedAt).toLocaleDateString()} {new Date(s.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <button 
                        className="delete-session-btn" 
                        onClick={(e) => deleteSession(e, s.id)}
                        title="Padam Perbualan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="ai-body">
                  {messages.map((msg, i) => (
                    <div key={i} className={`msg-row ${msg.role}`}>
                      <div className={`msg-bubble ${msg.role}`}>
                        {msg.content}
                        <span className="msg-time">
                          {mounted ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="msg-row assistant">
                      <div className="typing-indicator">
                        <span /><span /><span />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Pill Style Footer */}
                <form onSubmit={handleSend} className="ai-footer">
                  <div className="ai-input-wrapper">
                    <Smile size={20} style={{ color: '#94A3B8', cursor: 'pointer' }} />
                    <input 
                      className="ai-input"
                      value={input} 
                      onChange={(e) => setInput(e.target.value)} 
                      placeholder="Tulis mesej..." 
                    />
                    <Paperclip size={20} style={{ color: '#94A3B8', cursor: 'pointer', transform: 'rotate(45deg)' }} />
                  </div>
                  <button className="ai-send-btn" type="submit" disabled={!input.trim()}>
                    <Send size={20} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <button className="ai-fab" onClick={() => setIsOpen(!isOpen)}>
          <Bot size={32} color="var(--gold)" />
        </button>
      )}

      <style>{`
        .online-status { font-size: 0.7rem; color: #10B981; display: flex; align-items: center; gap: 5px; font-weight: 500; }
        .dot { width: 6px; height: 6px; background: #10B981; border-radius: 50%; box-shadow: 0 0 8px #10B981; }
        .icon-btn { background: transparent; border: none; color: #94A3B8; padding: 8px; cursor: pointer; border-radius: 50%; transition: all 0.2s; }
        .icon-btn:hover, .icon-btn.active-icon { background: rgba(255,255,255,0.08); color: white; }
        
        .ai-sidebar {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--navy);
          overflow: hidden;
        }
        .new-chat-btn {
          margin: 16px;
          padding: 12px;
          background: rgba(245, 166, 35, 0.1);
          color: var(--gold);
          border: 1px solid rgba(245, 166, 35, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .new-chat-btn:hover {
          background: rgba(245, 166, 35, 0.15);
        }
        .sessions-list {
          flex: 1;
          overflow-y: auto;
          padding: 0 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .session-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          background: var(--navy-mid);
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .session-item:hover {
          background: rgba(255,255,255,0.05);
        }
        .session-item.active {
          background: rgba(245, 166, 35, 0.08);
          border-color: rgba(245, 166, 35, 0.2);
          color: var(--gold);
        }
        .session-item.active .session-title { color: var(--gold); }
        .session-info { flex: 1; overflow: hidden; }
        .session-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .session-date {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        
        .delete-session-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
          display: flex;
        }
        .session-item:hover .delete-session-btn, .delete-session-btn:focus {
          opacity: 1;
        }
        .delete-session-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .typing-indicator { display: flex; gap: 4px; padding: 12px 18px; background: #1A2F50; border-radius: 18px; }
        .typing-indicator span { width: 6px; height: 6px; background: #94A3B8; border-radius: 50%; animation: type 1.2s infinite alternate; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes type { from { opacity: 0.3; transform: scale(0.8); } to { opacity: 1; transform: scale(1.1); } }
      `}</style>
    </motion.div>
  );
}
