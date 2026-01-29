
import React, { useEffect, useState, useRef } from 'react';
import { PersonaType } from '../types';
import { SaharaAI } from '../services/geminiService';

interface Props {
  persona: PersonaType;
  onClose: () => void;
  aiService: SaharaAI;
}

export const VoiceCall: React.FC<Props> = ({ persona, onClose, aiService }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Connecting Sahara...');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    const setupAudio = async () => {
      try {
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = inputCtx;
        outputAudioContextRef.current = outputCtx;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = aiService.connectLive(persona, {
          onopen: () => {
            setStatus('Main sun rahi/raha hoon...');
            setIsSpeaking(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: any) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputCtx) {
              setStatus('Sahara bol rahi/raha hai...');
              setIsSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                    setStatus('Main sun rahi/raha hoon...');
                    setIsSpeaking(false);
                }
              };
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus('Main sun rahi/raha hoon...');
              setIsSpeaking(false);
            }
          },
          onerror: (e: any) => {
            console.error(e);
            setStatus('Network error occurred');
          },
          onclose: () => {
            setStatus('Call ended');
            onClose();
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error(err);
        setStatus('Microphone access needed');
      }
    };

    setupAudio();

    return () => {
      audioContextRef.current?.close();
      outputAudioContextRef.current?.close();
      sessionRef.current?.close();
    };
  }, [persona]);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const isSister = persona === PersonaType.SISTER;
  const primaryColor = isSister ? 'text-pink-500' : 'text-blue-500';
  const bgColorClass = isSister ? 'sister-gradient' : 'brother-gradient';

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-between py-16 px-10 transition-all duration-1000 ${bgColorClass}`}>
      {/* Immersive Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div 
                key={i} 
                className="particle" 
                style={{ 
                    left: `${Math.random() * 100}%`, 
                    width: `${Math.random() * 6 + 2}px`, 
                    height: `${Math.random() * 6 + 2}px`,
                    animationDelay: `${Math.random() * 10}s`,
                    animationDuration: `${Math.random() * 15 + 10}s`,
                    background: isSister ? 'rgba(236, 72, 153, 0.3)' : 'rgba(59, 130, 246, 0.3)'
                }}
            />
        ))}
      </div>

      <div className="flex flex-col items-center text-center space-y-4 z-10">
        <div className={`px-6 py-2 rounded-full glass-card text-[10px] font-black uppercase tracking-[0.3em] ${primaryColor} shadow-sm`}>
          Sahara Call Active
        </div>
        <h2 className="text-5xl font-black text-gray-900 tracking-tight">
          {isSister ? 'Badi Behen' : 'Bada Bhai'}
        </h2>
        <p className="text-gray-500 font-bold text-lg h-6">
          {status}
        </p>
      </div>

      {/* Main Interactive Center - Stable and Non-shifting */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center space-y-16">
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Visual sound feedback around the avatar */}
            {isSpeaking && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`absolute w-full h-full rounded-full border-2 border-white/60 animate-ping`}></div>
                    <div className={`absolute w-[130%] h-[130%] rounded-full border-2 border-white/20 animate-pulse`}></div>
                    <div className={`absolute w-[160%] h-[160%] rounded-full border-2 border-white/10 animate-pulse delay-700`}></div>
                </div>
            )}

            <div className={`relative w-60 h-60 rounded-full shadow-[0_30px_70px_rgba(0,0,0,0.15)] flex items-center justify-center z-10 glass-card p-5 avatar-glow`}>
                <div className={`w-full h-full rounded-full flex items-center justify-center shadow-inner overflow-hidden ${isSister ? 'bg-gradient-to-br from-pink-400 via-pink-500 to-rose-600' : 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600'}`}>
                    <svg className="w-32 h-32 text-white drop-shadow-2xl transform hover:scale-105 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d={isSister ? "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" : "M12 14c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"} />
                    </svg>
                </div>
            </div>
        </div>

        {/* Waveform Visualizer - Reactive to status */}
        <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-sm px-10">
            {[...Array(32)].map((_, i) => (
                <div 
                    key={i} 
                    className={`waveform-bar transition-all duration-300 ${isSpeaking ? 'bar-active' : 'h-3 opacity-30'} ${isSister ? 'bg-pink-500' : 'bg-blue-500'}`}
                    style={{ 
                        animationDelay: `${i * 0.04}s`,
                        height: isSpeaking ? undefined : `${(Math.sin(i * 0.4) + 1.5) * 4}px`
                    }}
                />
            ))}
        </div>
      </div>

      {/* Modern Control Buttons */}
      <div className="flex items-center gap-14 z-20 mb-10">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="group flex flex-col items-center gap-4 transition-all duration-300 hover:scale-110 active:scale-90"
        >
          <div className={`w-18 h-18 rounded-[32px] glass-card flex items-center justify-center transition-all ${isMuted ? 'text-red-500 ring-4 ring-red-100 shadow-xl' : 'text-gray-700 shadow-md group-hover:bg-white'}`}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isMuted ? "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"} />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-600">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button 
          onClick={onClose}
          className="group flex flex-col items-center gap-4 transition-all duration-300 transform hover:scale-105"
        >
          <div className="w-24 h-24 rounded-[40px] bg-gradient-to-br from-red-500 via-rose-600 to-red-700 flex items-center justify-center shadow-[0_25px_50px_rgba(239,68,68,0.4)] hover:shadow-[0_30px_60px_rgba(239,68,68,0.5)] transition-all scale-110 active:scale-95 text-white">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-600">End Sahara Call</span>
        </button>
      </div>
    </div>
  );
};
