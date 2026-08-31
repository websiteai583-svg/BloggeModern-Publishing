import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Send, X, Bot, ShieldCheck, Sparkles } from 'lucide-react';

export const LiveSupportChat: React.FC = () => {
  const { isLiveChatOpen, setIsLiveChatOpen, chatMessages, sendChatMessage, language } = useApp();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLiveChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isLiveChatOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText.trim(), 'user');
    setInputText('');
  };

  return (
    <div id="live-chat-widget-container" className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-30">
      {!isLiveChatOpen ? (
        <button
          id="btn-open-live-chat"
          onClick={() => setIsLiveChatOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </div>
          <span className="hidden sm:inline">
            {language === 'bn' ? 'সরাসরি সাপোর্ট ও লাইভ চ্যাট' : 'Live Support Chat'}
          </span>
        </button>
      ) : (
        <div
          id="live-chat-window"
          className="w-80 sm:w-96 h-[460px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">
                  {language === 'bn' ? 'ব্লগার লাইভ সহায়তা' : 'Blogge Live Support'}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  <span className="text-[10px] text-white/90 font-medium">Online (Socket.io Real-time)</span>
                </div>
              </div>
            </div>
            <button
              id="btn-close-live-chat"
              onClick={() => setIsLiveChatOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            {chatMessages.map((msg) => {
              const isMe = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
                    {msg.senderName} • {msg.timestamp}
                  </span>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-orange-500 text-white rounded-br-none shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === 'bn' ? 'বার্তা লিখুন...' : 'Type a message...'}
              className="flex-1 px-3.5 py-2 text-xs rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white transition flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
