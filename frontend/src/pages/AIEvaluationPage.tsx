import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, Activity, Layers, CheckCircle2, Sparkles } from 'lucide-react';

export const AIEvaluationPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/ai/evaluation')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading AI Observability & Evaluation Metrics...</div>;

  const metrics = data?.metrics || {};
  const obs = data?.observability || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-indigo-600" />
          AI Intelligence & Evaluation Metrics
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">AI Observability & Benchmark Dashboard</h1>
        <p className="text-slate-600 text-sm mt-1">
          {data?.dataset_label || 'Hold-out Evaluation Dataset (50 Labelled Examples)'}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Classification Accuracy</span>
          <strong className="text-2xl font-extrabold text-indigo-600 block mt-1">{metrics.classification_accuracy_pct}%</strong>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Classification F1 Score</span>
          <strong className="text-2xl font-extrabold text-emerald-600 block mt-1">{metrics.classification_f1_score}</strong>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Duplicate Detection F1</span>
          <strong className="text-2xl font-extrabold text-sky-600 block mt-1">{metrics.duplicate_f1_score}</strong>
        </div>
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Average AI Latency</span>
          <strong className="text-2xl font-extrabold text-slate-900 block mt-1">{metrics.average_latency_ms} ms</strong>
        </div>
      </div>

      {/* Security & Observability Details */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>AI Prompt Injection Security & Observability Trace</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-slate-400 block font-semibold">Model Architecture</span>
            <strong className="text-sky-300 block font-mono text-sm">{obs.model_name}</strong>
          </div>
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-slate-400 block font-semibold">Prompt Injection Defense</span>
            <strong className="text-emerald-400 block font-mono text-sm">{obs.prompt_injection_defense}</strong>
          </div>
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-slate-400 block font-semibold">Vector Embedding Dimension</span>
            <strong className="text-amber-300 block text-sm">{obs.embeddings_dimension} float32</strong>
          </div>
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-slate-400 block font-semibold">Graceful Degradation Fallback</span>
            <strong className="text-emerald-300 block text-sm">{metrics.graceful_degradation}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
