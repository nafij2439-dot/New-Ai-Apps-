import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  Sun,
  Moon,
  Coffee,
  Volume2,
  Calendar,
  MessageCircleHeart,
  Smile,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { GFProfile } from '../types';

interface GFModeViewProps {
  profile: GFProfile;
  onUpdateProfile: (updated: Partial<GFProfile>) => void;
  onSendPresetMessage: (text: string) => void;
  isSpeaking: boolean;
  onTriggerGreeting: (type: 'morning' | 'night' | 'encouragement' | 'love_note') => void;
}

export const GFModeView: React.FC<GFModeViewProps> = ({
  profile,
  onUpdateProfile,
  onSendPresetMessage,
  isSpeaking,
  onTriggerGreeting,
}) => {
  const [customNickname, setCustomNickname] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);

  const predefinedNicknames = ['বাবু', 'জান', 'প্রিয়তম', 'সোনা', 'রাজা', 'Nafij'];

  const moodStatuses = {
    happy: 'হাসিখুশি ও ভীষণ আনন্দিত ✨',
    loving: 'তোমাকে খুব ভালোবাসছি 💕',
    pouting: 'একটু অভিমানী (কোথায় ছিলে?) 🥺',
    supportive: 'সব সময় তোমার পাশে আছি 🌸',
    sleepy: 'ঘুম ঘুম চোখে তোমার জন্য জেগে আছি 🌙',
  };

  const quickRomanticWhispers = [
    `কী করছো ${profile.nickname}? খেয়েছো তো ঠিকমতো?`,
    `আজকে তোমার দিনটা কেমন কাটলো ${profile.nickname}?`,
    `তোমার জন্য একটা মিষ্টি ভালোবাসার কবিতা শোনাবো?`,
    `মন খারাপ থাকলে বলো, তোমার মৌ সব শুনবে!`,
    `তোমাকে এক মুহূর্ত না দেখলে মনটা কেমন খালি খালি লাগে 💕`,
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Hero Avatar & Mood Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-500/30 p-6 shadow-2xl backdrop-blur-xl">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center gap-6 z-10">
          {/* Avatar Image with Romantic Aura */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-rose-500/40 shadow-xl shadow-rose-900/50 relative">
              <img
                src="/assets/aistudio/VID_20261025211905924_9a5b0b9e.jpg"
                alt="MOU AI - Girlfriend Avatar"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Online heart badge */}
              <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center border-2 border-slate-900 shadow">
                <Heart className="w-3.5 h-3.5 text-white fill-white animate-pulse" />
              </div>
            </div>
            {isSpeaking && (
              <div className="absolute -inset-2 rounded-3xl border border-rose-400/60 animate-ping pointer-events-none" />
            )}
          </div>

          {/* Name & Status */}
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>মৌ — তোমার পার্সোনাল প্রেমিকা (GF Mode)</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <span>হ্যালো আমার {profile.nickname}!</span>
              <span className="text-2xl">💖</span>
            </h2>
            <p className="text-sm text-rose-200/90 mt-1">
              বর্তমান অনুভূতি: <strong className="text-white">{moodStatuses[profile.mood]}</strong>
            </p>
            <p className="text-xs text-slate-400 mt-2 flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>নিরাপদ, সম্মানজনক ও সংবেদনশীল সঙ্গী • এআই সততা সংরক্ষিত</span>
            </p>
          </div>
        </div>

        {/* Quick Romantic Mood Buttons */}
        <div className="mt-6 pt-5 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-medium text-slate-300">মৌয়ের বর্তমান মেজাজ নির্বাচন করুন:</div>
          <div className="flex flex-wrap gap-2">
            {(['loving', 'happy', 'pouting', 'supportive', 'sleepy'] as const).map((m) => (
              <button
                key={m}
                onClick={() => onUpdateProfile({ mood: m })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  profile.mood === m
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                }`}
              >
                {m === 'loving' && 'রোমান্টিক 💖'}
                {m === 'happy' && 'হাসিখুশি 🌸'}
                {m === 'pouting' && 'অভিমানী 🥺'}
                {m === 'supportive' && 'পাশে থাকা 🕊️'}
                {m === 'sleepy' && 'ঘুমন্ত 🌙'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Greetings & Daily Care Generator */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Coffee className="w-5 h-5 text-amber-400" />
          <span>দৈনিক শুভেচ্ছা ও আদর (Scheduled & On-Demand Greetings)</span>
        </h3>
        <p className="text-xs text-slate-400">
          মৌ তোমাকে সময়মতো শুভ সকাল, শুভ রাত্রি বা ভালোবাসাভরা উৎসাহ পাঠাবে:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onTriggerGreeting('morning')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 transition group active:scale-95"
          >
            <Sun className="w-6 h-6 text-amber-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold">শুভ সকাল ☀️</span>
            <span className="text-[10px] text-amber-300/70 mt-0.5">দিনের শুরু আদর</span>
          </button>

          <button
            onClick={() => onTriggerGreeting('night')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 transition group active:scale-95"
          >
            <Moon className="w-6 h-6 text-indigo-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold">শুভ রাত্রি 🌙</span>
            <span className="text-[10px] text-indigo-300/70 mt-0.5">মিষ্টি ঘুমের গান</span>
          </button>

          <button
            onClick={() => onTriggerGreeting('encouragement')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 transition group active:scale-95"
          >
            <Smile className="w-6 h-6 text-emerald-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold">উৎসাহ ও সান্ত্বনা 🌸</span>
            <span className="text-[10px] text-emerald-300/70 mt-0.5">মন ভালো করার বাণী</span>
          </button>

          <button
            onClick={() => onTriggerGreeting('love_note')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-200 transition group active:scale-95"
          >
            <Heart className="w-6 h-6 text-rose-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-semibold">ভালোবাসার চিঠি 💌</span>
            <span className="text-[10px] text-rose-300/70 mt-0.5">হৃদয়ের অনুভূতি</span>
          </button>
        </div>
      </div>

      {/* Nickname & Affection Customization */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <MessageCircleHeart className="w-5 h-5 text-rose-400" />
          <span>ডাকনাম ও অনুভূতির মাত্রা (Nickname & Affection Settings)</span>
        </h3>

        {/* Nickname selection */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            মৌ তোমাকে কী নামে ডাকবে?
          </label>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {predefinedNicknames.map((name) => (
              <button
                key={name}
                onClick={() => onUpdateProfile({ nickname: name })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  profile.nickname === name
                    ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {name}
              </button>
            ))}
            <button
              onClick={() => setIsEditingNickname(!isEditingNickname)}
              className="text-xs text-rose-400 hover:underline px-2 py-1"
            >
              {isEditingNickname ? 'বাতিল' : '+ কাস্টম ডাকনাম'}
            </button>
          </div>

          {isEditingNickname && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                placeholder="আপনার পছন্দের ডাকনাম লিখুন (যেমন: পরানপাখি)..."
                value={customNickname}
                onChange={(e) => setCustomNickname(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={() => {
                  if (customNickname.trim()) {
                    onUpdateProfile({ nickname: customNickname.trim() });
                    setCustomNickname('');
                    setIsEditingNickname(false);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-xl transition"
              >
                সংরক্ষণ
              </button>
            </div>
          )}
        </div>

        {/* Affection Level */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            ভালোবাসা ও আদরের মাত্রা (Affection Level):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['Shy', 'Sweet', 'Romantic', 'Playful', 'Caring'] as const).map((level) => (
              <button
                key={level}
                onClick={() => onUpdateProfile({ affectionLevel: level })}
                className={`px-3 py-2 rounded-xl text-xs font-medium text-center transition ${
                  profile.affectionLevel === level
                    ? 'bg-rose-500/20 text-rose-200 border-2 border-rose-500 font-bold'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                {level === 'Shy' && 'লাজুক (Shy) 🙈'}
                {level === 'Sweet' && 'মিষ্টি (Sweet) 🍯'}
                {level === 'Romantic' && 'রোমান্টিক (Romantic) 💖'}
                {level === 'Playful' && 'দুষ্টুমি (Playful) 😜'}
                {level === 'Caring' && 'যত্নশীল (Caring) 🌸'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sweet Conversation Starters */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400" />
          <span>মৌয়ের সাথে কথা বলুন (Romantic Whispers)</span>
        </h3>
        <p className="text-xs text-slate-400">
          যেকোনো একটিতে ক্লিক করলেই মৌ সরাসরি মিষ্টি কণ্ঠে উত্তর দেবে:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {quickRomanticWhispers.map((whisper, idx) => (
            <button
              key={idx}
              onClick={() => onSendPresetMessage(whisper)}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 hover:bg-rose-950/30 border border-slate-800/80 hover:border-rose-500/40 text-left text-xs text-slate-200 hover:text-white transition group"
            >
              <span className="line-clamp-2">{whisper}</span>
              <Send className="w-3.5 h-3.5 text-rose-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
