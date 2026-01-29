
import React, { useState, useRef, useEffect } from 'react';
import { PersonaType, Message } from './types';
import { PersonaSelection } from './components/PersonaSelection';
import { SaharaAI } from './services/geminiService';
import { VoiceCall } from './components/VoiceCall';

const App: React.FC = () => {
  const [persona, setPersona] = useState<PersonaType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<SaharaAI | null>(null);

  useEffect(() => {
    aiRef.current = new SaharaAI();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handlePersonaSelect = (type: PersonaType) => {
    setPersona(type);
    aiRef.current?.initializeChat(type);
    
    const welcomeText = type === PersonaType.SISTER 
      ? "Hey, main dekh rahi hoon ki tum thodi pareshan ho. Dekho, darr lagta hai ki parents kya sochenge, par tum yahan mujhse khul kar baat kar sakti ho. Kya hua hai? Relax hokar batao."
      : "Suno, main dekh raha hoon tum thodi fikar mein ho. Ghabrao mat, bada bhai hoon tumhara. Jo bhi baat hai, be-jhijhak bata sakte ho. Sab theek ho jayega. Kya baat hai?";
      
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: welcomeText,
      timestamp: new Date()
    }]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping || !persona) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const modelMessageId = (Date.now() + 1).toString();
      let accumulatedResponse = "";
      
      setMessages(prev => [...prev, {
        id: modelMessageId,
        role: 'model',
        text: "",
        timestamp: new Date()
      }]);

      const stream = aiRef.current?.streamMessage(persona, input);
      if (stream) {
        for await (const chunk of stream) {
          accumulatedResponse += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === modelMessageId ? { ...msg, text: accumulatedResponse } : msg
          ));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  if (!persona) {
    return (
      <div className="h-screen bg-white overflow-hidden">
        <main className="h-full flex items-center justify-center">
          <PersonaSelection onSelect={handlePersonaSelect} />
        </main>
      </div>
    );
  }

  const isSister = persona === PersonaType.SISTER;

  return (
    <div className={`h-screen flex flex-col transition-colors duration-1000 ${isSister ? 'sister-gradient' : 'brother-gradient'}`}>
      {isCalling && aiRef.current && (
        <VoiceCall 
          persona={persona} 
          aiService={aiRef.current} 
          onClose={() => setIsCalling(false)} 
        />
      )}

      {/* Chat Header */}
      <header className="glass-panel px-8 py-6 flex items-center justify-between sticky top-0 z-10 border-b border-white/20">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setPersona(null)}
            className="p-3 hover:bg-white/40 rounded-2xl text-gray-700 transition-colors"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-4">
             <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-lg transform rotate-3 ${isSister ? 'bg-gradient-to-br from-pink-400 to-rose-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSister ? "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" : "M12 14c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"} />
                </svg>
             </div>
             <div>
                <h2 className="font-extrabold text-gray-900 text-2xl tracking-tight">
                  Sahara
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                  <p className={`text-[11px] ${isSister ? 'text-pink-600' : 'text-blue-600'} font-black uppercase tracking-[0.15em]`}>
                    {isSister ? 'Badi Behen Online' : 'Bada Bhai Online'}
                  </p>
                </div>
             </div>
          </div>
        </div>

        <button 
          onClick={() => setIsCalling(true)}
          className={`flex items-center gap-3 px-8 py-4 rounded-[24px] text-white font-black shadow-2xl transition-all hover:scale-105 active:scale-95 ${isSister ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" />
          </svg>
          Call
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-8 py-10 space-y-8 max-w-5xl mx-auto w-full scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6 duration-700`}
          >
            <div
              className={`max-w-[75%] px-7 py-5 rounded-[32px] shadow-sm text-lg leading-relaxed font-medium ${
                msg.role === 'user'
                  ? (isSister ? 'bg-pink-600' : 'bg-blue-600') + ' text-white rounded-br-none shadow-xl'
                  : 'glass-card text-gray-800 rounded-bl-none border-white/60'
              }`}
            >
              {msg.text || (msg.role === 'model' && isTyping ? '...' : '')}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="glass-card px-7 py-4 rounded-[24px] rounded-bl-none shadow-sm flex gap-2 items-center">
                <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${isSister ? 'bg-pink-400' : 'bg-blue-400'}`}></div>
                <div className={`w-2.5 h-2.5 rounded-full animate-bounce delay-150 ${isSister ? 'bg-pink-400' : 'bg-blue-400'}`}></div>
                <div className={`w-2.5 h-2.5 rounded-full animate-bounce delay-300 ${isSister ? 'bg-pink-400' : 'bg-blue-400'}`}></div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-8 glass-panel border-t border-white/30 backdrop-blur-3xl">
        <form 
          onSubmit={handleSend}
          className="max-w-5xl mx-auto flex items-end gap-5"
        >
          <div className="flex-1 relative">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
                }}
                placeholder="Likho, main sun rahi hoon..."
                className="w-full bg-white/70 border-2 border-white/50 focus:bg-white focus:border-white rounded-[32px] px-8 py-5 text-lg font-medium focus:ring-[12px] focus:ring-opacity-5 transition-all resize-none max-h-48 min-h-[64px] shadow-inner outline-none"
                style={{ ringColor: isSister ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)' }}
                rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`p-5 rounded-[24px] text-white shadow-2xl transition-all hover:scale-110 active:scale-90 disabled:opacity-50 disabled:scale-100 ${isSister ? 'bg-pink-600 shadow-pink-200' : 'bg-blue-600 shadow-blue-200'}`}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default App;
