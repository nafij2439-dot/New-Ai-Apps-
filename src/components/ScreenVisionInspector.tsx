import React, { useState, useRef } from 'react';
import {
  Scan,
  Monitor,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Smartphone,
  Sparkles,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface ScreenVisionInspectorProps {
  onSpeakText?: (text: string) => void;
}

export const ScreenVisionInspector: React.FC<ScreenVisionInspectorProps> = ({ onSpeakText }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [customQuestion, setCustomQuestion] = useState('Analyze this screen and tell me what actions I can take.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Live Display Media Capture (Screen capture API)
  const handleCaptureScreen = async () => {
    try {
      setErrorMsg(null);
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen capture API is not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Stop tracks
      stream.getTracks().forEach((t) => t.stop());

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      analyzeScreen(dataUrl, customQuestion);
    } catch (err: any) {
      console.warn('Screen capture error:', err);
      setErrorMsg(err?.message || 'স্ক্রিন ক্যাপচার করা সম্ভব হয়নি। স্ক্রিনশট আপলোড করে চেষ্টা করতে পারেন।');
    }
  };

  // 2. Upload Screenshot or Photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      analyzeScreen(dataUrl, customQuestion);
    };
    reader.readAsDataURL(file);
  };

  // 3. Load Sample Honor X8c Image (User Attachment)
  const handleLoadSampleDevicePhoto = async () => {
    try {
      setErrorMsg(null);
      const sampleUrl = '/assets/aistudio/IMG_20251108_174037_edit_463586549953412_2b1e7914.jpg';
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setCapturedImage(dataUrl);
        analyzeScreen(dataUrl, 'এই ছবিটি আমার Honor X8c ডিভাইসের ছবি। ডিভাইস, ক্যামেরা ওয়াটারমার্ক এবং ফ্রেম বিশ্লেষণ করে বলো।');
      };
      reader.readAsDataURL(blob);
    } catch (e: any) {
      setErrorMsg('নমুনা ছবি লোড করা যায়নি: ' + e.message);
    }
  };

  // 4. Send Image to Server-side Screen Understand endpoint
  const analyzeScreen = async (imageData: string, query: string) => {
    try {
      setIsAnalyzing(true);
      setErrorMsg(null);

      const res = await fetch('/api/screen-understand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          query,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'স্ক্রিন বিশ্লেষণ ব্যর্থ হয়েছে।');
      }

      setAnalysisText(data.analysis);
      if (onSpeakText && data.analysis) {
        // Option to speak summary
        const firstLine = data.analysis.split('\n')[0] || 'স্ক্রিন বিশ্লেষণ সম্পন্ন হয়েছে।';
        onSpeakText(firstLine);
      }
    } catch (err: any) {
      console.error('Vision analysis error:', err);
      setErrorMsg(err.message || 'বিশ্লেষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 mb-2">
              <Eye className="w-3.5 h-3.5" />
              <span>রিয়েল-টাইম স্ক্রিন আন্ডারস্ট্যান্ডিং (Vision Agent)</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Honor X8c স্ক্রিন ও ইন্টারফেস সহায়ক
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              যেকোনো অ্যাপের স্ক্রিনশট বা ছবি দিলে মৌ স্ক্রিনের বাটন, টেক্সট এবং ন্যাভিগেশন বিশ্লেষণ করে আপনাকে পথ দেখাবে।
            </p>
          </div>

          {/* Action capture triggers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCaptureScreen}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition active:scale-95"
            >
              <Monitor className="w-4 h-4" />
              <span>স্ক্রিন শেয়ার / ক্যাপচার</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span>স্ক্রিনশট আপলোড</span>
            </button>

            <button
              onClick={handleLoadSampleDevicePhoto}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 border border-purple-500/30 text-xs transition active:scale-95"
              title="ব্যবহারকারীর Honor X8c নমুনা ছবি দিয়ে পরীক্ষা করুন"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-300" />
              <span>Honor X8c টেস্ট ছবি</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>

      {/* Question / Instruction Customizer */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          মৌয়ের কাছে আপনার প্রশ্ন বা টাস্ক:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="যেমন: এই স্ক্রিনে কোন বাটনে ট্যাপ করতে হবে? অথবা সেটিংস কীভাবে বদলাব?"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          {capturedImage && (
            <button
              disabled={isAnalyzing}
              onClick={() => analyzeScreen(capturedImage, customQuestion)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>পুনরায় বিশ্লেষণ</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Screen Preview & Visual Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Screen Image Canvas */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col items-center justify-center min-h-[320px]">
          {capturedImage ? (
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
              <img
                src={capturedImage}
                alt="Captured Phone Screen"
                className="w-full max-h-[460px] object-contain mx-auto"
              />
              <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                <span>ভিজুয়াল ইনপুট সক্রিয়</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-slate-500 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                <Scan className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-300">কোনো স্ক্রিনশট এখনও দেওয়া হয়নি</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  আপনার ফোনের স্ক্রিন শেয়ার করুন বা গ্যালারি থেকে স্ক্রিনশট আপলোড করুন।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: AI Understanding Breakdown */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>মৌ এআই স্ক্রিন অ্যানালাইসিস ফলাফল</span>
          </h3>

          {isAnalyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-cyan-300 font-medium">স্ক্রিনের উপাদান ও বাটন বিশ্লেষণ করা হচ্ছে...</p>
              <p className="text-[11px] text-slate-500">Gemini 3.8 Multimodal Vision Engine</p>
            </div>
          ) : analysisText ? (
            <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 space-y-3 text-xs leading-relaxed text-slate-200">
              <div className="whitespace-pre-wrap font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {analysisText}
              </div>
              {onSpeakText && (
                <button
                  onClick={() => onSpeakText(analysisText)}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 border border-cyan-500/30 flex items-center justify-center gap-2 transition"
                >
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>বিশ্লেষণটি মুখে শুনুন</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <HelpCircle className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-xs">স্ক্রিন ক্যাপচার বা ছবি দিলে এখানে বিশদ নির্দেশিকা দেখা যাবে।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
