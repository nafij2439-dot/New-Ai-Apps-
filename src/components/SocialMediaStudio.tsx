import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Sparkles,
  Video,
  FileText,
  Instagram,
  Facebook,
  Youtube,
  Send,
  ExternalLink,
  Calendar,
  Layers,
} from 'lucide-react';
import { SocialMediaDraft } from '../types';

interface SocialMediaStudioProps {
  onSpeakText?: (text: string) => void;
}

export const SocialMediaStudio: React.FC<SocialMediaStudioProps> = ({ onSpeakText }) => {
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'tiktok' | 'youtube'>('instagram');
  const [contentType, setContentType] = useState<'post' | 'reel_short_script' | 'story' | 'title_description'>('reel_short_script');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [tone, setTone] = useState('আকর্ষণীয় ও ট্রেন্ডিং (Viral & Engaging)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultContent, setResultContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [drafts, setDrafts] = useState<SocialMediaDraft[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    try {
      setIsGenerating(true);
      const res = await fetch('/api/social-media/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          topic,
          contentType,
          language,
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');

      setResultContent(data.content);

      const newDraft: SocialMediaDraft = {
        id: Date.now().toString(),
        platform,
        topic,
        contentType,
        language,
        generatedContent: data.content,
        createdAt: Date.now(),
      };
      setDrafts([newDraft, ...drafts]);
    } catch (err: any) {
      console.error('Social generation error:', err);
      alert('কনটেন্ট তৈরি করা যায়নি: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!resultContent) return;
    navigator.clipboard.writeText(resultContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!resultContent) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `MOU AI Social Media: ${topic}`,
          text: resultContent,
        });
      } catch (e) {
        // Shared cancelled
      }
    } else {
      handleCopy();
      alert('ক্লিপবোর্ডে কপি করা হয়েছে! এখন আপনার সোশ্যাল মিডিয়া অ্যাপে পেস্ট করুন।');
    }
  };

  const openApp = () => {
    if (platform === 'facebook') window.open('https://facebook.com', '_blank');
    if (platform === 'instagram') window.open('https://instagram.com', '_blank');
    if (platform === 'tiktok') window.open('https://tiktok.com', '_blank');
    if (platform === 'youtube') window.open('https://youtube.com', '_blank');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold border border-pink-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>সোশ্যাল মিডিয়া ও কনটেন্ট স্টুডিও</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Facebook, Instagram, TikTok ও YouTube ক্রিয়েটর হাব
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Honor X8c ক্যামেরা ও স্ক্রিনের উপযোগী ভাইরাল রিল স্ক্রিপ্ট, ক্যাপশন, স্টোরি এবং ট্রেন্ডিং হ্যাশট্যাগ তৈরি করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        {/* Platform Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">প্ল্যাটফর্ম নির্বাচন করুন:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setPlatform('instagram')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                platform === 'instagram'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-400 shadow'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram</span>
            </button>

            <button
              onClick={() => setPlatform('facebook')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                platform === 'facebook'
                  ? 'bg-blue-600 text-white border-blue-400 shadow'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </button>

            <button
              onClick={() => setPlatform('youtube')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                platform === 'youtube'
                  ? 'bg-red-600 text-white border-red-400 shadow'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Youtube className="w-4 h-4" />
              <span>YouTube</span>
            </button>

            <button
              onClick={() => setPlatform('tiktok')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition ${
                platform === 'tiktok'
                  ? 'bg-purple-600 text-white border-purple-400 shadow'
                  : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>TikTok</span>
            </button>
          </div>
        </div>

        {/* Content Type & Tone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">কনটেন্টের ধরণ:</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            >
              <option value="reel_short_script">Reel / Short স্ক্রিপ্ট (হুক + বডি + বি-রোল)</option>
              <option value="post">স্ট্যান্ডার্ড পোস্ট ও ক্যাপশন (বাংলা ও ইংরেজি)</option>
              <option value="story">ফেসবুক / ইন্সটাগ্রাম স্টোরি স্ক্রিপ্ট</option>
              <option value="title_description">ইউটিউব টাইটেল, ডেসক্রিপশন ও এসইও ট্যাগ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">ভাষা ও টোন:</label>
            <div className="flex gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="bn">বাংলা (বাংলিশ সহ)</option>
                <option value="en">English</option>
              </select>
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="টোন (যেমন: হাস্যরসাত্মক, গভীর, প্রেরণামূলক)..."
                className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Topic Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            বিষয় বা মূল ধারণা (Topic / Idea):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="যেমন: Honor X8c ক্যামেরার সেরা ফিচারসমূহ অথবা একটি নতুন লাইফস্টাইল ভ্লগ..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-600/30 flex items-center gap-2 transition active:scale-95"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'তৈরি হচ্ছে...' : 'তৈরি করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Content Box */}
      {resultContent && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {platform} কনটেন্ট ড্রাফট প্রস্তুত
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'কপি হয়েছে!' : 'কপি'}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>শেয়ার</span>
              </button>

              <button
                onClick={openApp}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                title={`${platform} অ্যাপ খুলুন`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>অ্যাপে যান</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[450px] overflow-y-auto">
            {resultContent}
          </div>
        </div>
      )}

      {/* Preset Ideas for Quick Creation */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/60 p-4 space-y-2">
        <h5 className="text-xs font-semibold text-slate-400">ট্রেন্ডিং আইডিয়া দিয়ে শুরু করুন:</h5>
        <div className="flex flex-wrap gap-2">
          {[
            'Honor X8c নাইট মোড ফটোগ্রাফি টিপস',
            'ঢাকা শহরের লুকানো সেরা খাবারের জায়গা',
            'সকাল ৬টায় ঘুম থেকে ওঠার বাস্তব অভ্যাস',
            'YouTube Shorts এর জন্য ৫টি ভাইরাল টেক হ্যাকস',
          ].map((idea, i) => (
            <button
              key={i}
              onClick={() => {
                setTopic(idea);
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition"
            >
              + {idea}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
