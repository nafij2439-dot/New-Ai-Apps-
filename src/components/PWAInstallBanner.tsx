import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-900/90 via-slate-900 to-purple-950/90 border-b border-indigo-500/30 px-4 py-2.5 text-xs text-white flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="truncate">
            <strong className="text-indigo-200">Honor X8c অ্যাপ ইনস্টলেশন:</strong> আপনার হোম স্ক্রিনে MOU AI ইনস্টল করুন।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isInstallable && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition active:scale-95 shadow"
            >
              <Download className="w-3 h-3" />
              <span>ইনস্টল করুন</span>
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            APK গাইড
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* APK & Device Installation Guide Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Honor X8c এ MOU AI ইনস্টল ও APK ব্যবহারের নিয়ম
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <strong className="text-white block mb-1">১. ক্রোম বা ব্রাউজার থেকে সরাসরি ইনস্টলেশন (সেরা পদ্ধতি):</strong>
                ক্রোমের উপরের ডানদিকের <strong>তিনটি ডট (⋮)</strong> মেন্যুতে ক্লিক করুন এবং <strong>"Install app"</strong> বা <strong>"Add to Home screen"</strong> বাটনে ট্যাপ করুন। এটি আপনার Honor X8c ডিভাইসে নিজস্ব অ্যাপের মতো ইনস্টল হয়ে যাবে।
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <strong className="text-white block mb-1">২. স্ট্যান্ডঅ্যালোন APK প্যাকেজিং (Bubblewrap / TWA):</strong>
                গুগলের অফিসিয়াল <code>Bubblewrap CLI</code> বা <code>PWABuilder.com</code> এ এই অ্যাপের URL প্রবেশ করিয়ে সরাসরি সাইন্ড Android <code>.apk</code> বা <code>.aab</code> ফাইল তৈরি করা যায়।
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  পূর্ণ অফলাইন সাপোর্ট, ব্যাকগ্রাউন্ড সার্ভিস ও পুশ নোটিফিকেশনের জন্য PWA সার্ভিস ওয়ার্কার সক্রিয় রয়েছে।
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </>
  );
};
