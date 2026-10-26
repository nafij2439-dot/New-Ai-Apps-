import React, { useState } from 'react';
import {
  Smartphone,
  Phone,
  MessageSquare,
  Share2,
  Flashlight,
  Vibrate,
  Eye,
  Camera,
  MapPin,
  Youtube,
  Clock,
  Battery,
  BatteryCharging,
  AlertOctagon,
  CheckCircle,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

interface AndroidIntentHubProps {
  batteryLevel: number | null;
  isCharging: boolean | null;
  isTorchOn: boolean;
  onToggleTorch: () => Promise<boolean>;
  onVibrate: (pattern?: number | number[]) => void;
  isWakeLocked: boolean;
  onToggleWakeLock: () => Promise<boolean>;
  onEmergencyStop: () => void;
}

export const AndroidIntentHub: React.FC<AndroidIntentHubProps> = ({
  batteryLevel,
  isCharging,
  isTorchOn,
  onToggleTorch,
  onVibrate,
  isWakeLocked,
  onToggleWakeLock,
  onEmergencyStop,
}) => {
  const [phoneDialNumber, setPhoneDialNumber] = useState('');
  const [smsText, setSmsText] = useState('');
  const [whatsappText, setWhatsappText] = useState('');
  const [mapQuery, setMapQuery] = useState('');
  const [intentStatus, setIntentStatus] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setIntentStatus(msg);
    setTimeout(() => setIntentStatus(null), 3000);
  };

  // Launch real Phone dialer via tel:
  const launchDialer = () => {
    onVibrate(60);
    if (!phoneDialNumber) {
      window.location.href = 'tel:';
    } else {
      window.location.href = `tel:${encodeURIComponent(phoneDialNumber)}`;
    }
    showNotification('Honor X8c ডায়ালার খোলা হচ্ছে...');
  };

  // Launch SMS via sms:
  const launchSMS = () => {
    onVibrate(60);
    const url = smsText ? `sms:?body=${encodeURIComponent(smsText)}` : 'sms:';
    window.location.href = url;
    showNotification('মেসেজ অ্যাপ্লিকেশন খোলা হচ্ছে...');
  };

  // Launch WhatsApp
  const launchWhatsApp = () => {
    onVibrate(60);
    const url = whatsappText
      ? `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`
      : 'https://api.whatsapp.com/';
    window.open(url, '_blank');
    showNotification('WhatsApp খোলা হচ্ছে...');
  };

  // Launch Maps
  const launchMaps = () => {
    onVibrate(60);
    const query = mapQuery || 'Dhaka, Bangladesh';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
    showNotification('Google Maps খোলা হচ্ছে...');
  };

  // Launch YouTube
  const launchYouTube = () => {
    onVibrate(60);
    window.open('https://www.youtube.com', '_blank');
    showNotification('YouTube খোলা হচ্ছে...');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Device Info & Status Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 backdrop-blur-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Honor X8c স্মার্টফোন সংযোগ</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  MagicOS প্রস্তুত
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Android 13 / 14 • 108MP Matrix AI ক্যামেরা • 5120mAh ব্যাটারি
              </p>
            </div>
          </div>

          {/* Quick Hardware Indicators */}
          <div className="flex items-center gap-3">
            {batteryLevel !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                {isCharging ? (
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Battery className="w-4 h-4 text-cyan-400" />
                )}
                <span className="font-mono font-medium">{batteryLevel}%</span>
              </div>
            )}

            {/* Emergency Stop Button */}
            <button
              onClick={onEmergencyStop}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition active:scale-95 shadow-sm"
              title="জরুরি স্টপ: সমস্ত প্রক্রিয়া এবং ভয়েস থামান"
            >
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>ইমার্জেন্সি স্টপ</span>
            </button>
          </div>
        </div>

        {intentStatus && (
          <div className="mt-3 py-2 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{intentStatus}</span>
          </div>
        )}
      </div>

      {/* Real Hardware Toggles */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>হার্ডওয়্যার ও সিস্টেম কন্ট্রোল (Device Hardware Toggles)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Flashlight */}
          <button
            onClick={() => {
              onVibrate(50);
              onToggleTorch();
            }}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition active:scale-95 ${
              isTorchOn
                ? 'bg-amber-500/20 text-amber-200 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Flashlight className={`w-5 h-5 mb-1 ${isTorchOn ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-xs font-semibold">ফ্ল্যাশলাইট / টর্চ</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{isTorchOn ? 'চালু আছে' : 'বন্ধ'}</span>
          </button>

          {/* Haptic Vibration */}
          <button
            onClick={() => {
              onVibrate([100, 50, 100]);
              showNotification('ভাইব্রেশন পরীক্ষা সম্পন্ন হয়েছে।');
            }}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95"
          >
            <Vibrate className="w-5 h-5 mb-1 text-purple-400" />
            <span className="text-xs font-semibold">হ্যাপটিক ভাইব্রেশন</span>
            <span className="text-[10px] text-slate-400 mt-0.5">ফিডব্যাক টেস্ট</span>
          </button>

          {/* Screen Wake Lock */}
          <button
            onClick={() => {
              onVibrate(50);
              onToggleWakeLock();
            }}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition active:scale-95 ${
              isWakeLocked
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Eye className={`w-5 h-5 mb-1 ${isWakeLocked ? 'text-cyan-400' : 'text-slate-400'}`} />
            <span className="text-xs font-semibold">স্ক্রিন ওয়েক-লক</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{isWakeLocked ? 'স্ক্রিন সক্রিয়' : 'স্বাভাবিক'}</span>
          </button>

          {/* 108MP Camera trigger */}
          <label className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer active:scale-95">
            <Camera className="w-5 h-5 mb-1 text-emerald-400" />
            <span className="text-xs font-semibold">Honor ক্যামেরা</span>
            <span className="text-[10px] text-slate-400 mt-0.5">ছবি তুলুন</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  showNotification('ক্যামেরার ছবি সফলভাবে গৃহীত হয়েছে!');
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Android Intent Launchers */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-emerald-400" />
          <span>অ্যান্ড্রয়েড অ্যাপ ইন্টেন্টস (Android Official Intent Launchers)</span>
        </h4>
        <p className="text-xs text-slate-400">
          অফিসিয়াল অ্যান্ড্রয়েড সিস্টেম ইন্টেন্ট ব্যবহার করে সরাসরি আপনার Honor X8c ডিভাইসের অ্যাপগুলো খুলুন:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phone Call */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>ফোন ডায়ালার (Call Intent)</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="tel"
                placeholder="নম্বর লিখুন (যেমন: 017...)"
                value={phoneDialNumber}
                onChange={(e) => setPhoneDialNumber(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                onClick={launchDialer}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition"
              >
                কল দিন
              </button>
            </div>
          </div>

          {/* SMS Intent */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>মেসেজ (SMS Intent)</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="এসএমএস টেক্সট ড্রাফট..."
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                onClick={launchSMS}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition"
              >
                খুলুন
              </button>
            </div>
          </div>

          {/* WhatsApp Intent */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-green-400" />
                <span>WhatsApp শেয়ার ও চ্যাট</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="হোয়াটসঅ্যাপ বার্তা..."
                value={whatsappText}
                onChange={(e) => setWhatsappText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                onClick={launchWhatsApp}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition"
              >
                পাঠান
              </button>
            </div>
          </div>

          {/* Maps Intent */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>গুগল ম্যাপস (Maps Navigation)</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="স্থান বা ঠিকানা লিখুন..."
                value={mapQuery}
                onChange={(e) => setMapQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
              <button
                onClick={launchMaps}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition"
              >
                নেভিগেট
              </button>
            </div>
          </div>
        </div>

        {/* Quick App Direct Launchers */}
        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={launchYouTube}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-200 border border-red-500/40 text-xs font-medium transition"
          >
            <Youtube className="w-3.5 h-3.5 text-red-400" />
            <span>YouTube অ্যাপ</span>
          </button>

          <button
            onClick={() => {
              window.open('https://calendar.google.com', '_blank');
              showNotification('Google ক্যালেন্ডার খোলা হচ্ছে...');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-500/40 text-xs font-medium transition"
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>অ্যালার্ম ও ক্যালেন্ডার</span>
          </button>
        </div>
      </div>

      {/* Security & Honor Permission Policy */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>অ্যান্ড্রয়েড নিরাপত্তা প্রতিশ্রুতি (Security Guarantee)</span>
        </div>
        <p>
          MOU AI কখনই অননুমোদিতভাবে পাসওয়ার্ড, ওটিপি বা ব্যাংক একাউন্ট অ্যাক্সেস করে না। যেকোনো সংবেদনশীল পদক্ষেপ
          (বার্তা পাঠানো, ফাইল মোছা বা সেটিংস পরিবর্তন) গ্রহণের আগে আপনার সুস্পষ্ট অনুমোদন গ্রহণ করা হয়।
        </p>
      </div>
    </div>
  );
};
