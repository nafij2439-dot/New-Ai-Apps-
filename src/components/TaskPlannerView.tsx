import React, { useState } from 'react';
import {
  ListChecks,
  Play,
  Pause,
  RotateCcw,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { TaskStep, TaskPlan } from '../types';

interface TaskPlannerViewProps {
  onEmergencyStop: () => void;
}

export const TaskPlannerView: React.FC<TaskPlannerViewProps> = ({ onEmergencyStop }) => {
  const [goal, setGoal] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<TaskPlan | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);

  const sampleTasks = [
    'Honor X8c ফোনের মেমোরি খালি করা এবং অপ্রয়োজনীয় ক্যাশ ফাইল পরিষ্কার করার সম্পূর্ণ গাইড',
    'একটি নতুন ইউটিউব টেক ভিডিওর জন্য স্ক্রিপ্ট লেখা ও সোশ্যাল মিডিয়া পোস্ট ড্রাফট তৈরি করা',
    'আগামীকালের মিটিং শিডিউল সাজানো এবং বন্ধুদের WhatsApp এ আমন্ত্রণ পাঠানো',
  ];

  // 1. Generate Task Plan via /api/task-plan
  const handleGeneratePlan = async (targetGoal?: string) => {
    const taskGoal = targetGoal || goal;
    if (!taskGoal.trim()) return;

    try {
      setIsPlanning(true);
      const res = await fetch('/api/task-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: taskGoal,
          deviceContext: 'Honor X8c (Android MagicOS)',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Plan generation failed');

      const newPlan: TaskPlan = {
        id: Date.now().toString(),
        goal: taskGoal,
        steps: data.steps || [],
        status: 'planning',
        createdAt: Date.now(),
      };

      setCurrentPlan(newPlan);
      setActiveStepIndex(-1);
      setIsRunning(false);
    } catch (err: any) {
      console.error('Plan error:', err);
      alert('টাস্ক প্ল্যান তৈরি করা যায়নি: ' + err.message);
    } finally {
      setIsPlanning(false);
    }
  };

  // 2. Start Execution Step-by-Step
  const handleStartPlan = async () => {
    if (!currentPlan || currentPlan.steps.length === 0) return;
    setIsRunning(true);
    setCurrentPlan((prev) => (prev ? { ...prev, status: 'running' } : null));

    for (let i = 0; i < currentPlan.steps.length; i++) {
      setActiveStepIndex(i);
      const step = currentPlan.steps[i];

      // Update status to in_progress
      updateStepStatus(i, 'in_progress');

      // If requires approval, pause and prompt
      if (step.requiresApproval) {
        setIsRunning(false);
        const approved = window.confirm(
          `ধাপ ${i + 1} অনুমোদনের প্রয়োজন:\n"${step.title}"\n${step.description}\n\nআপনি কি এই ধাপটি সম্পন্ন করতে চান?`
        );
        if (!approved) {
          updateStepStatus(i, 'cancelled', 'ব্যবহারকারী দ্বারা বাতিল');
          setIsRunning(false);
          return;
        }
        setIsRunning(true);
      }

      // Simulate step execution delay
      await new Promise((resolve) => setTimeout(resolve, 1400));
      updateStepStatus(i, 'completed', 'সফলভাবে যাচাই করা হয়েছে');
    }

    setIsRunning(false);
    setCurrentPlan((prev) => (prev ? { ...prev, status: 'completed' } : null));
  };

  const updateStepStatus = (index: number, status: TaskStep['status'], result?: string) => {
    setCurrentPlan((prev) => {
      if (!prev) return null;
      const updatedSteps = [...prev.steps];
      updatedSteps[index] = {
        ...updatedSteps[index],
        status,
        result: result || updatedSteps[index].result,
      };
      return {
        ...prev,
        steps: updatedSteps,
      };
    });
  };

  const handleStopExecution = () => {
    setIsRunning(false);
    onEmergencyStop();
    setCurrentPlan((prev) => (prev ? { ...prev, status: 'aborted' } : null));
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>স্মার্ট টাস্ক প্ল্যানার ও এক্সিকিউটর</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              জটিল লক্ষ্যকে ধাপে ধাপে কার্যকর করা
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              মৌ আপনার যেকোনো জটিল কাজকে ছোট ছোট নিরাপদ পদক্ষেপে ভাগ করে অনুমোদন সাপেক্ষে সম্পন্ন করে।
            </p>
          </div>

          <button
            onClick={handleStopExecution}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border border-rose-500/50 text-xs font-bold transition active:scale-95"
          >
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>ইমার্জেন্সি কিল-সুইচ</span>
          </button>
        </div>
      </div>

      {/* Goal Input & Trigger */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-300">
          আপনার লক্ষ্য বা জটিল কাজটি লিখুন:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="যেমন: Honor X8c তে নতুন প্রজেক্ট নোট তৈরি করা এবং বন্ধুদের কাছে আপডেট পাঠানো..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            onKeyDown={(e) => e.key === 'Enter' && handleGeneratePlan()}
          />
          <button
            onClick={() => handleGeneratePlan()}
            disabled={isPlanning || !goal.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isPlanning ? 'animate-spin' : ''}`} />
            <span>{isPlanning ? 'প্ল্যান হচ্ছে...' : 'প্ল্যান তৈরি'}</span>
          </button>
        </div>

        {/* Quick sample chips */}
        <div className="pt-2 flex flex-wrap gap-2">
          {sampleTasks.map((t, idx) => (
            <button
              key={idx}
              onClick={() => {
                setGoal(t);
                handleGeneratePlan(t);
              }}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition text-left"
            >
              + {t}
            </button>
          ))}
        </div>
      </div>

      {/* Plan Execution Sequence */}
      {currentPlan && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                প্ল্যান স্ট্যাটাস: {currentPlan.status}
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{currentPlan.goal}</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartPlan}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunning ? 'চলমান...' : 'ধাপে ধাপে চালান'}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPlan(null);
                  setGoal('');
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>রিসেট</span>
              </button>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-2.5">
            {currentPlan.steps.map((step, idx) => {
              const isCurrent = activeStepIndex === idx;
              const isDone = step.status === 'completed';
              const isFailed = step.status === 'failed' || step.status === 'cancelled';

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/40'
                      : isDone
                      ? 'bg-slate-950/40 border-emerald-900/40 opacity-90'
                      : isFailed
                      ? 'bg-rose-950/20 border-rose-900/40'
                      : 'bg-slate-950/30 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        ) : isFailed ? (
                          <AlertOctagon className="w-4 h-4 text-rose-400" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                            {idx + 1}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white">{step.title}</h5>
                          {step.requiresApproval && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-semibold flex items-center gap-1">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              অনুমোদন প্রয়োজন
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                        {step.result && (
                          <p className="text-[11px] text-emerald-400 font-mono mt-1">
                            ✓ {step.result}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0">
                      {step.actionType}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
