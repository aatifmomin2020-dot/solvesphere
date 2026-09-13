"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Cpu, ShieldCheck, Activity, BarChart2 } from "lucide-react";

export default function AIObservabilityPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/ai/eval-metrics")
      .then((data) => setMetrics(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-purple-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-purple-700 uppercase">AI OBSERVABILITY & EVALUATION</span>
            <h1 className="text-2xl font-black text-slate-900">AI Intelligence Benchmark Dashboard</h1>
            <p className="text-xs text-slate-600">Model evaluation metrics, F1 scores, duplicate precision/recall, and latency monitoring.</p>
          </div>
        </div>

        <div className="bg-purple-50 text-purple-800 border border-purple-200 text-xs font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Holdout Benchmark (50 Samples)</span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500 animate-pulse">Loading AI evaluation metrics...</div>
      ) : (
        <div className="space-y-6">
          
          {/* Classification Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 block font-medium">Domain Classification Accuracy</span>
              <span className="text-3xl font-black text-sky-700">{Math.round(metrics.classification_metrics.accuracy * 100)}%</span>
              <span className="text-[10px] text-slate-500 block font-mono">50 Holdout Samples</span>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 block font-medium">Classification F1 Score</span>
              <span className="text-3xl font-black text-emerald-700">{metrics.classification_metrics.f1_score}</span>
              <span className="text-[10px] text-slate-500 block font-mono">Macro Average</span>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 block font-medium">Duplicate Search Precision</span>
              <span className="text-3xl font-black text-purple-700">{Math.round(metrics.duplicate_detection_metrics.duplicate_precision * 100)}%</span>
              <span className="text-[10px] text-slate-500 block font-mono">Cosine Threshold &gt;= 0.88</span>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
              <span className="text-xs text-slate-500 block font-medium">Duplicate Search Recall</span>
              <span className="text-3xl font-black text-amber-700">{Math.round(metrics.duplicate_detection_metrics.duplicate_recall * 100)}%</span>
              <span className="text-[10px] text-slate-500 block font-mono">Duplicate F1: {metrics.duplicate_detection_metrics.duplicate_f1}</span>
            </div>
          </div>

          {/* Model Performance Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-sky-600" />
                University & Industry Recommendation Relevance
              </h2>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Top-1 Recommendation Relevance</span>
                  <span className="font-mono text-sm font-bold text-sky-700">{Math.round(metrics.matching_relevance.top_1_relevance * 100)}%</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Top-3 Recommendation Relevance</span>
                  <span className="font-mono text-sm font-bold text-emerald-700">{Math.round(metrics.matching_relevance.top_3_relevance * 100)}%</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Government Acceptance Rate</span>
                  <span className="font-mono text-sm font-bold text-amber-700">{Math.round(metrics.matching_relevance.government_acceptance_rate * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Runtime Performance & Prompt Shielding
              </h2>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Average Embedding Latency</span>
                  <span className="font-mono text-sm font-bold text-purple-700">{metrics.performance_observability.average_latency_ms} ms</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-700 font-medium">AI Failure Rate</span>
                  <span className="font-mono text-sm font-bold text-emerald-700">{metrics.performance_observability.ai_failure_rate * 100}%</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Estimated Token Cost / Request</span>
                  <span className="font-mono text-sm font-bold text-slate-900">${metrics.performance_observability.estimated_token_cost_usd}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
