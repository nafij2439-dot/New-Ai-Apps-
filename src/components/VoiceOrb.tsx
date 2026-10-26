import React from 'react';
import { Mic, MicOff, Square, Sparkles, Heart } from 'lucide-react';
import { AppMode } from '../types';

interface VoiceOrbProps {
  mode: AppMode;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  lang: 'bn-BD' | 'en-US';
  onToggleLang: () => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  mode,
  isListening,
  isSpeaking,
  isThinking,
  onToggleMic,
  onStopSpeaking,
  lang,
  onToggleLang,
}) => {
  const isGF = mode === 'gf';

  return (
    <div className="relative flex flex-col items-center justify-center py-6 px-4">
      {/* Outer Glow Halo */}
      <div
        className={`absolute w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isGF
            ? isSpeaking
              ? 'bg-rose-500/40 scale-125'
              : isListening
              ? 'bg-pink-500/30 scale-110'
              : 'bg-rose-950/20 scale-95'
            : isSpeaking
            ? 'bg-cyan-500/40 scale-125'
            : isListening
            ? 'bg-indigo-500/30 scale-110'
            : 'bg-blue-950/20 scale-95'
        }`}
      />

      {/* Main Interactive Orb */}
      <div className="relative">
        {/* Pulsing rings when active */}
        {(isListening || isSpeaking || isThinking) && (
          <div
            className={`absolute inset-0 rounded-full ${
              isGF ? 'animate-pulse-ring-gf' : 'animate-pulse-ring-assistant'
            }`}
          />
        )}

        {/* Orbit Ring */}
        <div
          className={`absolute -inset-4 rounded-full border border-dashed transition-all duration-1000 ${
            isGF ? 'border-rose-400/40' : 'border-cyan-400/40'
          } ${isThinking ? 'animate-spin' : isSpeaking ? 'animate-pulse' : ''}`}
        />

        {/* Clickable Voice Orb Center */}
        <button
          onClick={onToggleMic}
          title={isListening ? 'ক্লিক করে কথা থামান' : 'ক্লিক করে মৌকে কিছু বলুন'}
          className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
            isGF
              ? isSpeaking
                ? 'bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-300 shadow-rose-500/50 scale-105 ring-4 ring-rose-400/40'
                : isListening
                ? 'bg-gradient-to-tr from-pink-600 to-rose-500 shadow-pink-500/50 ring-4 ring-pink-400/50 animate-pulse'
                : 'bg-gradient-to-tr from-rose-900 via-purple-900 to-pink-900 shadow-rose-950/40 hover:scale-105'
              : isSpeaking
              ? 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-500 shadow-cyan-500/50 scale-105 ring-4 ring-cyan-400/40'
              : isListening
              ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-indigo-500/50 ring-4 ring-cyan-400/50 animate-pulse'
              : 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 shadow-slate-950/60 hover:scale-105'
          }`}
        >
          {isGF ? (
            <Heart
              className={`w-10 h-10 transition-transform ${
                isSpeaking ? 'text-white animate-bounce' : 'text-rose-200'
              }`}
            />
          ) : (
            <Sparkles
              className={`w-10 h-10 transition-transform ${
                isSpeaking ? 'text-white animate-spin' : 'text-cyan-200'
              }`}
            />
          )}

          <span className="mt-1 text-xs font-semibold text-white tracking-wider">
            {isSpeaking
              ? 'বলছে...'
              : isThinking
              ? 'ভাবছে...'
              : isListening
              ? 'শুনছি...'
              : 'মৌ'}
          </span>
        </button>
      </div>

      {/* Voice Waveform Bars */}
      <div className="flex items-center gap-1.5 h-6 mt-4">
        {[40, 75, 55, 95, 60, 85, 45, 100, 65, 80, 50].map((height, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isGF ? 'bg-rose-400' : 'bg-cyan-400'
            }`}
            style={{
              height: isSpeaking || isListening ? `${height}%` : '15%',
              opacity: isSpeaking || isListening ? 0.9 : 0.25,
            }}
          />
        ))}
      </div>

      {/* Voice Controls Bar */}
      <div className="flex items-center gap-3 mt-4">
        {/* Toggle Mic */}
        <button
          onClick={onToggleMic}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
            isListening
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60'
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5 text-red-400" />
              <span>মাইক বন্ধ করুন</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>মুখে কথা বলুন</span>
            </>
          )}
        </button>

        {/* Barge-in / Interrupt Speech */}
        {isSpeaking && (
          <button
            onClick={onStopSpeaking}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-rose-500/30 text-rose-200 border border-rose-500/50 hover:bg-rose-500/40 transition active:scale-95"
            title="মৌয়ের কথা থামান (Interrupt / Stop)"
          >
            <Square className="w-3 h-3 fill-rose-300" />
            <span>থামো</span>
          </button>
        )}

        {/* Language Toggle */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition"
          title="ভাষা পরিবর্তন করুন"
        >
          <span className="text-slate-400">ভাষা:</span>
          <span className="font-semibold text-emerald-400">
            {lang === 'bn-BD' ? 'বাংলা (BD)' : 'English'}
          </span>
        </button>
      </div>
    </div>
  );
};
