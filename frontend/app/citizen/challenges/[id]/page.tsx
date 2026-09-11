"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import EcosystemFlow from "@/components/EcosystemFlow";
import { 
  MapPin, AlertTriangle, Cpu, CheckCircle2, ShieldCheck, 
  Building2, GraduationCap, Building, ThumbsUp, AlertCircle, ArrowRight 
} from "lucide-react";

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chId = (params?.id as string) || "SS-1042";

  const [challenge, setChallenge] = useState<any>(null);
  const [matches, setMatches] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    loadChallengeData();
  }, [chId]);

  const loadChallengeData = async () => {
    setLoading(true);
    try {
      const chData = await fetchApi(`/challenges/${chId}`);
      setChallenge(chData);

      const mData = await fetchApi(`/challenges/${chId}/matches`);
      setMatches(mData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyGovernment = async (action: string) => {
    setActionLoading(true);
    try {
      await fetchApi(`/challenges/${chId}/verify`, {
        method: "POST",
        body: JSON.stringify({ action, notes: "Verified by Government Officer during SIH live demo" })
      });
      loadChallengeData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptUniversity = async () => {
    setActionLoading(true);
    try {
      const res = await fetchApi(`/projects?challenge_id=${chId}`, { method: "POST" });
      router.push(`/projects/${res.project_id}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinIndustry = async () => {
    setActionLoading(true);
    try {
      const projId = `SS-P-${chId.replace("SS-", "")}`;
      await fetchApi(`/projects/${projId}/join-industry`, { method: "POST" });
      router.push(`/projects/${projId}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs font-mono text-slate-500 animate-pulse">Loading challenge AI analysis...</div>;
  }

  if (!challenge) {
    return <div className="py-20 text-center text-xs text-rose-400">Challenge not found</div>;
  }

  const getStageFromStatus = (st: string) => {
    if (st === "AI_ANALYZED") return "ANALYZE";
    if (st === "VERIFIED") return "VERIFY";
    if (st === "IN_PROJECT" || st === "PROTOTYPE") return "COLLABORATE";
    return "SUBMIT";
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded border border-sky-800">
              {challenge.id}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded">
              Status: {challenge.status}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">{challenge.title}</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {challenge.location_name}
          </p>
        </div>

        {/* Dynamic Action Button depending on User Role */}
        <div className="flex items-center gap-2">
          {user?.role === "GOVERNMENT" && challenge.status !== "VERIFIED" && (
            <button
              onClick={() => handleVerifyGovernment("VERIFY")}
              disabled={actionLoading}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verify Challenge (Gov)
            </button>
          )}

          {user?.role === "UNIVERSITY" && (
            <button
              onClick={handleAcceptUniversity}
              disabled={actionLoading}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              Accept Project (Uni)
            </button>
          )}

          {user?.role === "INDUSTRY" && (
            <button
              onClick={handleJoinIndustry}
              disabled={actionLoading}
              className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs transition shadow-lg flex items-center gap-1.5"
            >
              <Building className="w-4 h-4" />
              Join Project (Industry)
            </button>
          )}
        </div>
      </div>

      <EcosystemFlow activeStage={getStageFromStatus(challenge.status)} />

      {/* AI ANALYSIS & EXPLAINABLE PRIORITY SCORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            AI Domain Classification & Description
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {challenge.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Domain:</span>
              <span className="font-bold text-sky-400">{challenge.category}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Sub-domain:</span>
              <span className="font-bold text-slate-200">{challenge.sub_category}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Frequency:</span>
              <span className="font-bold text-slate-200">{challenge.frequency}</span>
            </div>
          </div>
        </div>

        {/* Explainable Priority Score Breakdown */}
        <div className="bg-slate-900 border border-amber-500/30 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Priority Score</h3>
            <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded">
              {challenge.priority_level}
            </span>
          </div>

          <div className="text-center py-2">
            <span className="text-4xl font-black text-amber-400">{challenge.priority_score}</span>
            <span className="text-xs text-slate-500 block font-mono">Normalized (0 - 100)</span>
          </div>

          <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Impact (40%):</span>
              <span className="font-bold text-sky-400">{challenge.impact_score}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Urgency (30%):</span>
              <span className="font-bold text-amber-400">{challenge.urgency_score}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Evidence Quality (30%):</span>
              <span className="font-bold text-emerald-400">{challenge.evidence_score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEMANTIC DUPLICATES WARNING */}
      {challenge.potential_duplicates && challenge.potential_duplicates.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/40 p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Semantic Duplicate Candidate Detected</span>
          </div>
          <p className="text-xs text-slate-300">
            SBERT vector similarity search identified existing potential duplicate reports. Human validation required before merging.
          </p>

          <div className="space-y-2">
            {challenge.potential_duplicates.map((dup: any) => (
              <div key={dup.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-amber-900/50 text-xs">
                <div>
                  <span className="font-mono text-sky-400 font-bold mr-2">{dup.id}</span>
                  <span className="text-slate-200">{dup.title}</span>
                </div>
                <span className="bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-1 rounded">
                  {dup.similarity_score}% Cosine Match
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UNIVERSITY & INDUSTRY MATCHES */}
      {matches && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Top University Matches */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              AI University Recommendations
            </h3>

            <div className="space-y-3">
              {matches.university_matches?.map((u: any, idx: number) => (
                <div key={u.university_id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-200">{idx + 1}. {u.university_name}</span>
                    <span className="bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs px-2 py-0.5 rounded">
                      {u.match_score}% Match
                    </span>
                  </div>

                  <ul className="text-[11px] text-slate-400 space-y-1">
                    {u.matched_reasons?.map((r: string, rIdx: number) => (
                      <li key={rIdx} className="flex items-center gap-1 text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Top Industry CSR Matches */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building className="w-5 h-5 text-purple-400" />
              AI Industry & CSR Partners
            </h3>

            <div className="space-y-3">
              {matches.industry_matches?.map((ind: any, idx: number) => (
                <div key={ind.industry_id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-200">{idx + 1}. {ind.org_name}</span>
                    <span className="bg-purple-500/20 text-purple-300 font-mono font-bold text-xs px-2 py-0.5 rounded">
                      {ind.match_score}% Fit
                    </span>
                  </div>

                  <ul className="text-[11px] text-slate-400 space-y-1">
                    {ind.matched_reasons?.map((r: string, rIdx: number) => (
                      <li key={rIdx} className="flex items-center gap-1 text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-purple-400 flex-shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
