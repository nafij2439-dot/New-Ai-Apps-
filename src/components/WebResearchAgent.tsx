import React, { useState } from 'react';
import {
  Globe,
  Search,
  Sparkles,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

interface WebResearchAgentProps {
  onSpeakText?: (text: string) => void;
}

export const WebResearchAgent: React.FC<WebResearchAgentProps> = ({ onSpeakText }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [summary, setSummary] = useState('');
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setIsSearching(true);
      setSummary('');
      setSources([]);

      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Research failed');

      setSummary(data.summary);
      setSources(data.sources || []);
    } catch (err: any) {
      console.error('Research error:', err);
      alert('অনুসন্ধান ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>ইন্টারনেট রিসার্চ ও ওয়েব এজেন্ট (Google Search Grounded)</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              লাইভ ওয়েব সার্চ ও বাংলা তথ্য সংশ্লেষণ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              সরাসরি গুগল সার্চ গ্রাউন্ডিং প্রযুক্তি ব্যবহার করে বর্তমান খবর, তথ্য ও ঘটনা বাংলায় যাচাই করে উপস্থাপন করে।
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          অনুসন্ধানের বিষয় বা প্রশ্ন লিখুন:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="যেমন: Honor X8c এর সেরা আপডেট ও ট্রিকস, অথবা আজকের ক্রিকেট ম্যাচের খবর..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
          >
            <Search className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'অনুসন্ধান চলছে...' : 'অনুসন্ধান'}</span>
          </button>
        </div>

        {/* Quick Topics */}
        <div className="pt-2 flex flex-wrap gap-2">
          {[
            'Honor X8c MagicOS লেটেস্ট ফিচার',
            'বাংলাদেশে কৃত্রিম বুদ্ধিমত্তা ব্যবহারের ভবিষ্যৎ',
            'ঢাকা আজকের আবহাওয়া ও ট্রাফিক পরিস্থিতি',
          ].map((t, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(t);
              }}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              + {t}
            </button>
          ))}
        </div>
      </div>

      {/* Results Card */}
      {summary && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>রিসার্চ সারসংক্ষেপ ও সত্যতা যাচাই</span>
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>

              {onSpeakText && (
                <button
                  onClick={() => onSpeakText(summary)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition"
                >
                  মুখে শুনুন
                </button>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
            {summary}
          </div>

          {/* Sources Citations */}
          {sources.length > 0 && (
            <div className="pt-2">
              <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                যাচাইকৃত ওয়েব তথ্যসূত্র ({sources.length}):
              </h5>
              <div className="flex flex-wrap gap-2">
                {sources.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 text-xs border border-slate-700/60 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{s.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
