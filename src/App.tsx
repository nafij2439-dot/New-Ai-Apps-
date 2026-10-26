/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Heart,
  Eye,
  Smartphone,
  Layers,
  Share2,
  Brain,
  Globe,
  Send,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  AlertOctagon,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { AppMode, ChatMessage, MemoryItem, GFProfile } from './types';
import { VoiceOrb } from './components/VoiceOrb';
import { GFModeView } from './components/GFModeView';
import { ScreenVisionInspector } from './components/ScreenVisionInspector';
import { AndroidIntentHub } from './components/AndroidIntentHub';
import { TaskPlannerView } from './components/TaskPlannerView';
import { SocialMediaStudio } from './components/SocialMediaStudio';
import { MemoryVault } from './components/MemoryVault';
import { WebResearchAgent } from './components/WebResearchAgent';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useDeviceHardware } from './hooks/useDeviceHardware';

export default function App() {
  // 1. App State
  const [mode, setMode] = useState<AppMode>('assistant');
  const [activeTab, setActiveTab] = useState<'chat' | 'gf' | 'vision' | 'phone' | 'planner' | 'social' | 'memory' | 'research'>('chat');
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  // Audio Context & Element for TTS playback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 2. Persistent Memory & User Settings
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('mou_ai_memories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: '1',
        category: 'nickname',
        key: 'ব্যবহারকারীর ডাকনাম',
        value: 'বাবু',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '2',
        category: 'preference',
        key: 'স্মার্টফোন মডেল',
        value: 'Honor X8c (Android MagicOS)',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '3',
        category: 'preference',
        key: 'পছন্দের ভাষা',
        value: 'বাংলাদেশি বাংলা ও ইংরেজি মিশ্রিত',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];
  });

  // Save memories to localStorage
  useEffect(() => {
    localStorage.setItem('mou_ai_memories', JSON.stringify(memories));
  }, [memories]);

  // GF Profile state
  const [gfProfile, setGfProfile] = useState<GFProfile>(() => {
    const saved = localStorage.getItem('mou_ai_gf_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      nickname: 'বাবু',
      affectionLevel: 'Romantic',
      mood: 'loving',
      morningGreetingTime: '08:00 AM',
      nightGreetingTime: '11:30 PM',
      customNotes: [],
    };
  });

  useEffect(() => {
    localStorage.setItem('mou_ai_gf_profile', JSON.stringify(gfProfile));
  }, [gfProfile]);

  // 3. Conversation Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('mou_ai_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content:
          'আসসালামু আলাইকুম! আমি মৌ (MOU AI), আপনার Honor X8c স্মার্টফোনের নিজস্ব এআই সহকারী ও সঙ্গী। ফোন পরিচালনা, স্ক্রিন বিশ্লেষণ, সোশ্যাল মিডিয়া কনটেন্ট তৈরি, অথবা মিষ্টি কথোপকথন—আমি সবসময় আপনার পাশে আছি। বলুন, আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
        timestamp: Date.now(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('mou_ai_messages', JSON.stringify(messages.slice(-50)));
  }, [messages]);

  // 4. Hardware Hooks
  const {
    batteryLevel,
    isCharging,
    isTorchOn,
    toggleTorch,
    vibrate,
    isWakeLocked,
    toggleWakeLock,
    isOnline,
    emergencyStop: hardwareEmergencyStop,
  } = useDeviceHardware();

  // 5. Speech Recognition Hook
  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    interimTranscript,
    recognitionLang,
    setRecognitionLang,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    language: 'bn-BD',
    onResult: (text) => {
      if (text.trim()) {
        handleSendMessage(text);
      }
    },
    onWakeWordDetected: () => {
      vibrate(100);
    },
  });

  // Chat scroll container
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab, isAiThinking]);

  // 6. Stop Speaking / Barge-in
  const handleStopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // 7. TTS Playback
  const speakText = async (text: string) => {
    try {
      handleStopSpeaking();
      setIsSpeaking(true);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          mode,
          voiceName: 'Kore',
        }),
      });

      const data = await res.json();
      if (res.ok && data.audio) {
        const audioSrc = `data:${data.mimeType || 'audio/wav'};base64,${data.audio}`;
        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.onended = () => setIsSpeaking(false);
          audioRef.current.onerror = () => {
            fallbackBrowserTts(text);
          };
          await audioRef.current.play();
        }
      } else {
        fallbackBrowserTts(text);
      }
    } catch (err) {
      console.warn('Server TTS error, using fallback:', err);
      fallbackBrowserTts(text);
    }
  };

  // Fallback to Web Speech Synthesis in browser
  const fallbackBrowserTts = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.lang = recognitionLang === 'bn-BD' ? 'bn-BD' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = mode === 'gf' ? 1.2 : 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  // 8. Send Chat Message
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content && !attachedImage) return;

    vibrate(40);
    setInputText('');
    const currentAttachedImage = attachedImage;
    setAttachedImage(null);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      image: currentAttachedImage || undefined,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsAiThinking(true);

    try {
      const memoryStrings = memories.map((m) => `${m.key}: ${m.value}`);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          mode,
          userName: gfProfile.nickname || 'বাবু',
          affectionLevel: gfProfile.affectionLevel,
          memories: memoryStrings,
          image: currentAttachedImage || undefined,
          useSearch: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI উত্তর দিতে পারেনি।');
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        sources: data.sources,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      // Speak the AI response
      speakText(data.reply);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `দুঃখিত, সংযোগে সমস্যা হয়েছে: ${err.message || 'আবার চেষ্টা করুন'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // 9. Full Emergency Stop
  const handleFullEmergencyStop = () => {
    hardwareEmergencyStop();
    handleStopSpeaking();
    stopListening();
    vibrate([200, 100, 200]);
    alert('জরুরি স্টপ কার্যকর করা হয়েছে: সমস্ত প্রক্রিয়া, আলো ও ভয়েস অবিলম্বে স্থগিত করা হলো।');
  };

  // 10. Greetings in GF Mode
  const handleTriggerGreeting = async (type: 'morning' | 'night' | 'encouragement' | 'love_note') => {
    const promptMap = {
      morning: `মৌ, শুভ সকাল! আমাকে মিষ্টি একটা সকালের শুভেচ্ছা এবং অনুপ্রেরণামূলক বার্তা দাও।`,
      night: `মৌ, এখন ঘুমাতে যাব। আমাকে ভালোবাসাভরা একটি শুভ রাত্রি বার্তা ও মিষ্টি কথা বলো।`,
      encouragement: `আজকে মনটা একটু খারাপ। আমাকে সান্ত্বনা দাও এবং ভালোবাসা দিয়ে উৎসাহ জাগাও।`,
      love_note: `আমাকে উদ্দেশ্য করে হৃদয়স্পর্শী একটি মিষ্টি প্রেমপত্র বা অনুভূতির কথা শোনাও।`,
    };
    setActiveTab('chat');
    handleSendMessage(promptMap[type]);
  };

  // Image Upload handler for chat
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${
      mode === 'gf'
        ? 'bg-slate-950 text-rose-50 selection:bg-rose-500/40'
        : 'bg-slate-950 text-slate-100 selection:bg-cyan-500/40'
    }`}>
      {/* Hidden Audio Element for TTS */}
      <audio ref={audioRef} className="hidden" />

      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Top Device & App Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-500 px-4 py-3 ${
        mode === 'gf'
          ? 'bg-slate-950/80 border-rose-900/40 shadow-rose-950/20'
          : 'bg-slate-950/80 border-slate-800 shadow-slate-950/30'
      }`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Mode indicator */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
              mode === 'gf'
                ? 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-rose-600/40'
                : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-cyan-600/40'
            }`}>
              {mode === 'gf' ? <Heart className="w-5 h-5 fill-white" /> : <Bot className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  <span>MOU AI</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono font-normal bg-slate-800 text-slate-300">
                    Honor X8c
                  </span>
                </h1>
                {isOnline ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="অনলাইন" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="অফলাইন" />
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {mode === 'gf' ? '💖 মৌ — তোমার মিষ্টি প্রেমিকা' : '⚡ পার্সোনাল এআই অ্যাসিস্ট্যান্ট'}
              </p>
            </div>
          </div>

          {/* Right Header Controls: Mode Toggle & Emergency Stop */}
          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 flex items-center shadow-inner">
              <button
                onClick={() => {
                  vibrate(40);
                  setMode('assistant');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'assistant'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">অ্যাসিস্ট্যান্ট</span>
              </button>

              <button
                onClick={() => {
                  vibrate(40);
                  setMode('gf');
                  if (activeTab === 'chat') setActiveTab('gf');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'gf'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-rose-200" />
                <span className="hidden sm:inline">প্রেমিকা মোড</span>
              </button>
            </div>

            {/* Emergency Stop Button */}
            <button
              onClick={handleFullEmergencyStop}
              className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition active:scale-90"
              title="ইমার্জেন্সি স্টপ"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-5xl mx-auto mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-medium">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'chat'
                ? mode === 'gf'
                  ? 'bg-rose-600 text-white'
                  : 'bg-cyan-600 text-white'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>চ্যাট ও ভয়েস</span>
          </button>

          <button
            onClick={() => setActiveTab('gf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'gf'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>GF স্পেস</span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'vision'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>স্ক্রিন ভিশন</span>
          </button>

          <button
            onClick={() => setActiveTab('phone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'phone'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span>Honor X8c হাব</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'planner'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>টাস্ক প্ল্যানার</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'social'
                ? 'bg-pink-600 text-white'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-pink-400" />
            <span>সোশ্যাল স্টুডিও</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'memory'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>মেমোরি ভল্ট</span>
          </button>

          <button
            onClick={() => setActiveTab('research')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              activeTab === 'research'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>ওয়েব রিসার্চ</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col">
        {/* TAB 1: Chat & Voice Core */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            {/* Interactive Voice Orb */}
            <VoiceOrb
              mode={mode}
              isListening={isListening}
              isSpeaking={isSpeaking}
              isThinking={isAiThinking}
              onToggleMic={() => {
                vibrate(50);
                if (isListening) stopListening();
                else startListening();
              }}
              onStopSpeaking={handleStopSpeaking}
              lang={recognitionLang}
              onToggleLang={() => {
                setRecognitionLang(recognitionLang === 'bn-BD' ? 'en-US' : 'bn-BD');
              }}
            />

            {/* Interim Speech Transcription Banner */}
            {interimTranscript && (
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs text-center animate-pulse">
                শুনছি: "{interimTranscript}"
              </div>
            )}

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[500px] pr-1">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                        mode === 'gf'
                          ? 'bg-rose-600 text-white ring-2 ring-rose-400/30'
                          : 'bg-cyan-600 text-white ring-2 ring-cyan-400/30'
                      }`}>
                        {mode === 'gf' ? <Heart className="w-4 h-4 fill-white" /> : <Bot className="w-4 h-4" />}
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg text-xs leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-tr-none'
                        : mode === 'gf'
                        ? 'bg-rose-950/40 border border-rose-500/30 text-rose-50 rounded-tl-none backdrop-blur-md'
                        : 'bg-slate-900/80 border border-slate-800 text-slate-100 rounded-tl-none backdrop-blur-md'
                    }`}>
                      {msg.image && (
                        <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 max-w-xs">
                          <img src={msg.image} alt="User attachment" className="w-full h-auto object-cover" />
                        </div>
                      )}

                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Web search sources if any */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                          <span className="text-[10px] text-slate-400 font-semibold block">তথ্যসূত্র:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((s, i) => (
                              <a
                                key={i}
                                href={s.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:underline bg-slate-950/60 px-2 py-0.5 rounded"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span className="truncate max-w-[150px]">{s.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Text to Speech button on each assistant turn */}
                      {!isUser && (
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-1.5">
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <button
                            onClick={() => speakText(msg.content)}
                            className="flex items-center gap-1 hover:text-white transition"
                            title="আবার শুনুন"
                          >
                            <Volume2 className="w-3 h-3 text-cyan-400" />
                            <span>শুনুন</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>মৌ চিন্তা করছে ও তথ্য প্রস্তুত করছে...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none text-[11px]">
              {[
                mode === 'gf' ? 'কেমন আছো মৌ জান?' : 'Honor X8c ফোনের ব্যাটারি সাশ্রয়ী টিপস দাও',
                mode === 'gf' ? 'আমাকে মিষ্টি একটা ভালোবাসার কথা শোনাও 💕' : 'আমার ফোনের স্ক্রিনশট কীভাবে বিশ্লেষণ করবে?',
                'আজকের প্রধান খবর কী?',
                'YouTube Shorts এর জন্য একটি স্ক্রিপ্ট তৈরি করো',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 whitespace-nowrap transition active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Attached Image Preview */}
            {attachedImage && (
              <div className="relative inline-flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 w-fit">
                <img src={attachedImage} alt="Thumbnail preview" className="w-12 h-12 object-cover rounded-lg" />
                <span className="text-xs text-slate-300">ছবি সংযুক্ত হয়েছে</span>
                <button
                  onClick={() => setAttachedImage(null)}
                  className="ml-2 text-rose-400 hover:text-rose-300 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="relative flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-2 shadow-2xl backdrop-blur-xl">
              <label
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="ছবি বা স্ক্রিনশট সংযুক্ত করুন"
              >
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </label>

              <input
                type="text"
                placeholder={
                  mode === 'gf'
                    ? `মৌয়ের সাথে কথা বলুন... (যেমন: "কী করছো জান?")`
                    : 'মৌকে কিছু করতে বলুন বা প্রশ্ন করুন...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none px-2"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() && !attachedImage}
                className={`p-2.5 rounded-xl text-white transition disabled:opacity-40 active:scale-95 shadow-md ${
                  mode === 'gf'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'
                }`}
                title="পাঠান"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: GF Mode Space */}
        {activeTab === 'gf' && (
          <GFModeView
            profile={gfProfile}
            onUpdateProfile={(updated) => setGfProfile((prev) => ({ ...prev, ...updated }))}
            onSendPresetMessage={(text) => {
              setActiveTab('chat');
              handleSendMessage(text);
            }}
            isSpeaking={isSpeaking}
            onTriggerGreeting={handleTriggerGreeting}
          />
        )}

        {/* TAB 3: Screen Vision Inspector */}
        {activeTab === 'vision' && <ScreenVisionInspector onSpeakText={speakText} />}

        {/* TAB 4: Android Intent Hub */}
        {activeTab === 'phone' && (
          <AndroidIntentHub
            batteryLevel={batteryLevel}
            isCharging={isCharging}
            isTorchOn={isTorchOn}
            onToggleTorch={toggleTorch}
            onVibrate={vibrate}
            isWakeLocked={isWakeLocked}
            onToggleWakeLock={toggleWakeLock}
            onEmergencyStop={handleFullEmergencyStop}
          />
        )}

        {/* TAB 5: Task Planner */}
        {activeTab === 'planner' && <TaskPlannerView onEmergencyStop={handleFullEmergencyStop} />}

        {/* TAB 6: Social Media Studio */}
        {activeTab === 'social' && <SocialMediaStudio onSpeakText={speakText} />}

        {/* TAB 7: Memory Vault */}
        {activeTab === 'memory' && (
          <MemoryVault
            memories={memories}
            onAddMemory={(category, key, value) => {
              const item: MemoryItem = {
                id: Date.now().toString(),
                category,
                key,
                value,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              setMemories([item, ...memories]);
            }}
            onDeleteMemory={(id) => {
              setMemories(memories.filter((m) => m.id !== id));
            }}
            onClearAll={() => setMemories([])}
            onImportMemories={(imported) => setMemories(imported)}
          />
        )}

        {/* TAB 8: Web Research Agent */}
        {activeTab === 'research' && <WebResearchAgent onSpeakText={speakText} />}
      </main>

      {/* Footer Status */}
      <footer className="border-t border-slate-900 bg-slate-950/60 px-4 py-2 text-center text-[10px] text-slate-500">
        MOU AI • Personal Assistant & Bengali Voice Companion for Honor X8c • Powered by Gemini 3.8
      </footer>
    </div>
  );
}
