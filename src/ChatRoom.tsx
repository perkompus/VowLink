import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LogOut } from 'lucide-react';

interface Message {
  id: string;
  session_id: string;
  sender_name: string;
  role: 'user' | 'assistant' | 'mediator';
  content: string;
  created_at: string;
}

export default function ChatRoom() {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMediating, setIsMediating] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myName = localStorage.getItem('vowlink_name');

  useEffect(() => {
    if (!myName) {
      navigate('/');
      return;
    }

    let realtimeChannel: any;

    const setupSession = async () => {
      // 1. Get Session ID from PIN
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('id')
        .eq('pin_code', pin)
        .single();

      if (sessionError || !sessionData) {
        console.error('Session not found', sessionError);
        navigate('/');
        return;
      }

      const currentSessionId = sessionData.id;
      setSessionId(currentSessionId);

      // 2. Fetch existing messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
      }

      // 3. Subscribe to realtime changes
      realtimeChannel = supabase
        .channel(`messages_${currentSessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `session_id=eq.${currentSessionId}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (newMsg.role === 'mediator') {
              setIsMediating(false);
            }
            setMessages((prev) => {
              // Ensure we don't duplicate if we already have it locally
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        )
        .subscribe();
    };

    setupSession();

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [pin, navigate, myName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Visual Viewport API for iOS Keyboard handling
  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        // Calculate how much the viewport shrunk
        const offset = window.innerHeight - window.visualViewport.height;
        // On iOS, sometimes it reports a small difference even without keyboard, so threshold it
        setKeyboardOffset(offset > 50 ? offset : 0);
        window.scrollTo(0, 0); // Keep document at top
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || !myName) return;

    const newContent = input.trim();
    setInput('');

    // Generate temp ID for optimistic UI update could go here, 
    // but relying on realtime avoids complex state syncing for now.

    const newMessageData = {
      session_id: sessionId,
      sender_name: myName,
      role: 'user' as const,
      content: newContent,
    };

    const { error } = await supabase
      .from('messages')
      .insert([newMessageData]);

    if (error) {
      console.error('Failed to send message', error);
      setInput(newContent); // Restore on fail
    } else {
      setIsMediating(true);
      const currentMessages = [...messages, newMessageData];
      
      // Trigger AI Mediation
      supabase.functions.invoke('mediate-conflict', { 
        body: { session_id: sessionId, messages: currentMessages, sessionId } 
      }).catch(err => {
        console.error('Edge function failed:', err);
        setIsMediating(false);
      });
    }
  };

  const handleEndSession = async () => {
    if (sessionId) {
      await supabase.from('sessions').delete().eq('id', sessionId);
    }
    localStorage.removeItem('vowlink_name');
    setMessages([]);
    setSessionId(null);
    setIsMediating(false);
    navigate('/');
  };

  return (
    <div 
      className="flex-1 flex flex-col w-full h-full relative" 
      style={{ paddingBottom: keyboardOffset ? `${keyboardOffset}px` : 'env(safe-area-inset-bottom)' }}
    >
      <header className="flex-none p-4 border-b-0.5 border-borderGray flex justify-between items-center max-w-2xl mx-auto w-full">
        <div className="text-sm opacity-50 tracking-widest">PIN: {pin}</div>
        <button onClick={handleEndSession} className="text-sm opacity-70 hover:opacity-100 flex items-center gap-1 transition-opacity">
          End <LogOut size={14} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8 max-w-2xl mx-auto w-full scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.role === 'user' && msg.sender_name === myName;
            const isAI = msg.role === 'assistant' || msg.role === 'mediator';

            if (isAI) {
              const isReflection = msg.content.startsWith('Reflection:');
              const isObservation = msg.content.startsWith('Observation:');
              const cleanContent = msg.content.replace(/^(Reflection:|Observation:)\s*/i, '');

              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="self-center w-full text-center font-mono text-[#888] my-6 px-4"
                >
                  {isReflection && (
                    <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2 italic">
                      Reflection
                    </div>
                  )}
                  {isObservation && (
                    <div className="text-[10px] uppercase tracking-widest opacity-80 mb-2 font-bold">
                      Observation
                    </div>
                  )}
                  {!isReflection && !isObservation && (
                    <div className="text-[10px] uppercase tracking-widest opacity-60 mb-2">
                      VowLink
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
                    {cleanContent}
                  </p>
                </motion.div>
              );
            }

            if (isMe) {
              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="self-end w-3/4 sm:w-2/3 pr-4 border-r-0.5 border-borderGray text-right"
                >
                  <div className="text-xs opacity-40 mb-2">Me</div>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </motion.div>
              );
            }

            // Partner
            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="self-start w-3/4 sm:w-2/3 pl-4 border-l-0.5 border-borderGray text-left"
              >
                <div className="text-xs opacity-40 mb-2">{msg.sender_name}</div>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {isMediating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-400 text-[12px] font-mono mt-4"
          >
            VowLink is reflecting...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div 
        className="mt-auto border-t-0.5 border-borderGray bg-background max-w-2xl mx-auto w-full"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <form onSubmit={handleSendMessage} className="flex items-end p-2 gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Message..."
            className="flex-1 p-3 bg-transparent outline-none resize-none min-h-[44px] max-h-32"
            rows={1}
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="p-3 text-textMain disabled:opacity-30 mb-0.5 transition-opacity"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
