
import React from 'react';
import { PersonaType } from '../types';

interface Props {
  onSelect: (type: PersonaType) => void;
}

export const PersonaSelection: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="relative flex flex-col items-center justify-center p-6 text-center h-full max-w-6xl mx-auto overflow-hidden">
      {/* Decorative Blobs */}
      <div className="bg-blob w-[400px] h-[400px] bg-pink-100 -top-20 -left-20"></div>
      <div className="bg-blob w-[400px] h-[400px] bg-blue-100 -bottom-20 -right-20"></div>

      <div className="space-y-8 flex flex-col items-center mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
        <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-400 rounded-[2.5rem] blur-xl opacity-20 animate-pulse"></div>
            <div className="w-28 h-28 bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 rounded-[2.5rem] rotate-6 flex items-center justify-center shadow-2xl relative">
                <span className="text-white text-6xl font-black -rotate-6">S</span>
            </div>
        </div>
        
        <div className="space-y-2">
            <h1 className="text-8xl font-black text-gray-900 tracking-tighter leading-none">
              Sahara
            </h1>
            <p className="text-gray-400 font-bold text-sm tracking-[0.3em] uppercase">Main hoon na</p>
        </div>
        
        <p className="text-gray-500 max-w-md text-xl font-semibold leading-relaxed">
          Ghabrao mat, jo bhi baat hai <br/>
          hum yahin hain sunne ke liye.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full px-6 max-w-5xl animate-in fade-in zoom-in duration-1000 delay-300">
        <button
          onClick={() => onSelect(PersonaType.SISTER)}
          className="group relative flex flex-col items-center p-14 bg-white/80 backdrop-blur-md rounded-[60px] shadow-xl hover:shadow-2xl hover:shadow-pink-100 border border-white transition-all duration-500 transform hover:-translate-y-4"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-pink-50/40 to-transparent rounded-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(244,63,94,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          
          <h3 className="text-4xl font-black text-gray-800 tracking-tight">Badi Behen</h3>
          <div className="mt-6 flex flex-col items-center gap-3">
            <span className="text-pink-600 font-black text-xs tracking-widest uppercase px-6 py-2 rounded-full bg-pink-100/50">Pyari Awaaz</span>
            <p className="text-gray-400 font-bold text-sm">Emotional & Loving Care</p>
          </div>
        </button>

        <button
          onClick={() => onSelect(PersonaType.BROTHER)}
          className="group relative flex flex-col items-center p-14 bg-white/80 backdrop-blur-md rounded-[60px] shadow-xl hover:shadow-2xl hover:shadow-blue-100 border border-white transition-all duration-500 transform hover:-translate-y-4"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 to-transparent rounded-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-8 shadow-[0_20px_40px_rgba(59,130,246,0.3)] group-hover:scale-110 group-hover:-rotate-6 transition-all">
            <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z" />
            </svg>
          </div>
          
          <h3 className="text-4xl font-black text-gray-800 tracking-tight">Bada Bhai</h3>
          <div className="mt-6 flex flex-col items-center gap-3">
            <span className="text-blue-600 font-black text-xs tracking-widest uppercase px-6 py-2 rounded-full bg-blue-100/50">Himmat Wali Awaaz</span>
            <p className="text-gray-400 font-bold text-sm">Strong & Protective Support</p>
          </div>
        </button>
      </div>
      
      <div className="mt-16 text-gray-400 flex items-center gap-2 font-bold text-xs tracking-widest uppercase">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/></svg>
          100% Private & Safe
      </div>
    </div>
  );
};
