"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { GraduationCap, CheckCircle2, Cpu, ArrowRight, ShieldCheck, Award } from "lucide-react";

export default function UniversityMatchesPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApi("/universities/recommendations")
      .then((data) => setRecommendations(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleAcceptProject = async (challengeId: string) => {
    setAcceptingId(challengeId);
    try {
      const res = await fetchApi(`/projects?challenge_id=${challengeId}`, { method: "POST" });
      router.push(`/projects/${res.project_id}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">UNIVERSITY MATCHING ENGINE</span>
            <h1 className="text-2xl font-black text-white">AI-Recommended Civic Challenges</h1>
            <p className="text-xs text-slate-400">Ranked recommendations based on ABC University faculty expertise, research domains, and labs.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500 animate-pulse">
          Computing multi-factor SBERT similarity matches...
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={rec.challenge_id} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl space-y-4 transition shadow-lg">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded border border-sky-800">
                    {rec.challenge_id}
                  </span>
                  <h3 className="text-lg font-bold text-white">{rec.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold px-3 py-1 rounded-lg">
                    {rec.match_score}% AI Match Fit
                  </span>
                  <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded">
                    {rec.priority_level}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Domain:</span>
                  <span className="font-bold text-sky-400">{rec.category} / {rec.sub_category}</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Location & Affected:</span>
                  <span className="font-bold text-slate-200">{rec.location_name} ({rec.people_affected} citizens)</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Ecosystem Status:</span>
                  <span className="font-bold text-emerald-400">{rec.status}</span>
                </div>
              </div>

              {/* Matched Reasons */}
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-950 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">AI Match Rationale</span>
                <div className="flex flex-wrap gap-3 text-xs">
                  {rec.matched_reasons?.map((reason: string, rIdx: number) => (
                    <span key={rIdx} className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Link
                  href={`/citizen/challenges/${rec.challenge_id}`}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  View Details
                </Link>
                
                <button
                  onClick={() => handleAcceptProject(rec.challenge_id)}
                  disabled={acceptingId === rec.challenge_id}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg flex items-center gap-2"
                >
                  {acceptingId === rec.challenge_id ? "Forming Project..." : "Accept & Form University Project →"}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
