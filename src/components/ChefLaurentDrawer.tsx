import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Wheat,
  Thermometer,
  RotateCcw,
  User,
  Lightbulb
} from 'lucide-react';
import { playClickSound, playChimeSound } from '../utils/audio';

interface Message {
  id: string;
  sender: 'user' | 'chef';
  text: string;
  time: string;
}

interface ChefLaurentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChefLaurentDrawer: React.FC<ChefLaurentDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'chef',
      text: 'Bonjour! I am Chef Laurent, your AI Master Boulanger-Pâtissier. How can I assist your bake shift today? We can optimize dough hydration, troubleshoot lamination, tune deck oven steam, or calibrate morning schedules.',
      time: '06:00 AM',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const promptSuggestions = [
    'How do I fix a gummy sourdough crumb when the bakery is 28°C?',
    'What is the optimal water temperature for 24°C DDT today?',
    'How to prevent butter melt in croissants during final proof?',
    'Suggest high-margin specials to repurpose day-old brioche.',
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (messageText: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    playClickSound();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            bakery: 'Lumière Bakehouse',
            ambientTemp: '24.2°C',
            humidity: '58%',
            activeDecks: 2,
          },
        }),
      });

      const data = await res.json();
      if (data && data.reply) {
        const chefMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'chef',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, chefMsg]);
        playChimeSound();
      }
    } catch (e) {
      console.error('Chef Laurent error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white border-l border-stone-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
      {/* Drawer Header */}
      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-stone-900 text-sm">Chef Laurent AI</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-stone-500">Master Baker & Bakery Operations AI</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'chef' && (
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Wheat className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 shadow-2xs space-y-1 ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-white font-medium rounded-tr-xs'
                  : 'bg-stone-100/90 text-stone-800 border border-stone-200/50 rounded-tl-xs'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span
                className={`text-[9px] block text-right ${
                  msg.sender === 'user' ? 'text-amber-100' : 'text-stone-400'
                }`}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-stone-500 text-xs italic bg-stone-50 p-2.5 rounded-xl border border-stone-100 w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span>Chef Laurent is calculating formula science...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-stone-50/70 border-t border-stone-100 space-y-1.5">
        <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-600" />
          <span>Quick Expert Queries</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {promptSuggestions.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200/80 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-stone-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Chef Laurent about formulas, crumb, ovens..."
            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
