import React, { useState } from 'react';
import {
  Brain,
  Trash2,
  Plus,
  Download,
  Upload,
  ShieldCheck,
  Calendar,
  User,
  Heart,
  Briefcase,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { MemoryItem } from '../types';

interface MemoryVaultProps {
  memories: MemoryItem[];
  onAddMemory: (category: MemoryItem['category'], key: string, value: string) => void;
  onDeleteMemory: (id: string) => void;
  onClearAll: () => void;
  onImportMemories: (imported: MemoryItem[]) => void;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAll,
  onImportMemories,
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('preference');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    onAddMemory(newCategory, newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `mou-ai-memory-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportMemories(parsed);
          alert('মেমোরি ব্যাকআপ সফলভাবে ইম্পোর্ট করা হয়েছে!');
        }
      } catch (err) {
        alert('অকার্যকর মেমোরি ফাইল!');
      }
    };
    reader.readAsText(file);
  };

  const filteredMemories = memories.filter(
    (m) =>
      m.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 mb-2">
              <Brain className="w-3.5 h-3.5" />
              <span>লং-টার্ম পার্সোনাল মেমোরি সিস্টেম (Memory Vault)</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              ব্যবহারকারীর পছন্দ ও তথ্য নিয়ন্ত্রণ
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              মৌ আপনার দেওয়া পছন্দ, ডাকনাম ও গুরুত্বপূর্ণ তথ্য নিরাপদে সংরক্ষণ করে যাতে বারবার একই প্রশ্ন করতে না হয়।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              title="মেমোরি JSON হিসেবে ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>এক্সপোর্ট</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>ইম্পোর্ট</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
            </label>

            <button
              onClick={() => {
                if (window.confirm('আপনি কি সত্যি সমস্ত মেমোরি মুছে ফেলতে চান?')) {
                  onClearAll();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-medium border border-rose-500/30 transition"
              title="সমস্ত মেমোরি মুছুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>সব মুছুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add New Memory Card */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-400" />
          <span>নতুন মেমোরি যুক্ত করুন (Add Knowledge / Preference)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="preference">পছন্দ (Preference)</option>
            <option value="nickname">ডাকনাম (Nickname)</option>
            <option value="routine">দৈনিক রুটিন (Routine)</option>
            <option value="project">প্রজেক্ট / কাজ (Project)</option>
            <option value="date">গুরুত্বপূর্ণ তারিখ (Date)</option>
            <option value="secret_boundary">নিরাপত্তা ও সীমা (Boundary)</option>
          </select>

          <input
            type="text"
            placeholder="মেমোরি নাম (যেমন: প্রিয় খাবার)..."
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />

          <input
            type="text"
            placeholder="বিবরণ (যেমন: কাচ্চি বিরিয়ানি ও চা)..."
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!newKey.trim() || !newValue.trim()}
          className="w-full sm:w-auto px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
        >
          মেমোরিতে সংরক্ষণ করুন
        </button>
      </div>

      {/* Memory List with Search */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-cyan-400" />
            <span>সংরক্ষিত মেমোরিসমূহ ({memories.length})</span>
          </h4>

          <input
            type="text"
            placeholder="মেমোরি খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {filteredMemories.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            কোনো মেমোরি পাওয়া যায়নি। উপরে নতুন মেমোরি যোগ করুন অথবা মৌয়ের সাথে কথা বলুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredMemories.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50">
                      {m.category}
                    </span>
                    <h5 className="text-xs font-bold text-white">{m.key}</h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{m.value}</p>
                  <p className="text-[10px] text-slate-500">
                    সংরক্ষিত: {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => onDeleteMemory(m.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition shrink-0"
                  title="মেমোরিটি মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Transparency Box */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>গোপনীয়তা ও স্বচ্ছতা নিশ্চয়তা</span>
        </div>
        <p>
          আপনার অনুমতি ছাড়া কোনো তথ্য কারো সাথে শেয়ার করা হয় না। পাসওয়ার্ড, ওটিপি, ক্রেডিট কার্ড বা গোপনীয় তথ্য
          মেমোরিতে রাখা নিষিদ্ধ। আপনি যেকোনো মুহূর্তে যেকোনো মেমোরি সম্পাদনা বা মুছে ফেলতে পারবেন।
        </p>
      </div>
    </div>
  );
};
