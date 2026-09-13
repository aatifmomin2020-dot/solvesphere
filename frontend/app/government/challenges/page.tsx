"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { Building2, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";

export default function GovernmentVerificationQueuePage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    loadQueue();
  }, []);

  const loadQueue = () => {
    setLoading(true);
    fetchApi("/challenges")
      .then((data) => setChallenges(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleVerify = async (chId: string, action: string) => {
    setActionLoading(chId);
    try {
      await fetchApi(`/challenges/${chId}/verify`, {
        method: "POST",
        body: JSON.stringify({ action, notes: "Processed by Government Official" })
      });
      loadQueue();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingList = challenges.filter((c) => c.status === "AI_ANALYZED" || c.status === "PENDING_VERIFICATION");
  const verifiedList = challenges.filter((c) => c.status === "VERIFIED" || c.status === "IN_PROJECT");

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-amber-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-amber-700 uppercase">GOVERNMENT VERIFICATION QUEUE</span>
            <h1 className="text-2xl font-black text-slate-900">Municipal Verification & Approval Queue</h1>
            <p className="text-xs text-slate-600">Review AI priority scores, resolve duplicate reports, and approve verified challenges.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500 animate-pulse">Loading verification queue...</div>
      ) : (
        <div className="space-y-6">
          
          {/* Pending Section */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between">
              <span>Pending Official Review ({pendingList.length})</span>
              <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 font-bold">
                Action Required
              </span>
            </h2>

            <div className="space-y-4">
              {pendingList.map((ch) => (
                <div key={ch.id} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {ch.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{ch.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded">
                        Priority: {ch.priority_score} ({ch.priority_level})
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{ch.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 block">Domain:</span>
                      <span className="font-bold text-sky-700">{ch.category}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 block">Location:</span>
                      <span className="font-bold text-slate-800">{ch.location_name}</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 block">Affected:</span>
                      <span className="font-bold text-slate-800">{ch.people_affected} Citizens</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-500 block">Severity:</span>
                      <span className="font-bold text-rose-700">{ch.severity}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href={`/citizen/challenges/${ch.id}`}
                      className="text-xs font-bold text-sky-700 hover:text-sky-800"
                    >
                      View AI Insights & Duplicate Detection →
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerify(ch.id, "REJECT")}
                        disabled={actionLoading === ch.id}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>

                      <button
                        onClick={() => handleVerify(ch.id, "VERIFY")}
                        disabled={actionLoading === ch.id}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Official Verify ✓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Section */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
              Verified & Active Challenges ({verifiedList.length})
            </h2>

            <div className="space-y-3">
              {verifiedList.map((ch) => (
                <div key={ch.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {ch.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{ch.title}</span>
                    </div>
                    <p className="text-xs text-slate-600">{ch.location_name} • Category: {ch.category}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-100 text-emerald-800 font-mono text-xs px-2.5 py-1 rounded font-bold border border-emerald-200">
                      {ch.status}
                    </span>

                    <Link
                      href={`/citizen/challenges/${ch.id}`}
                      className="text-xs font-bold text-sky-700 hover:text-sky-800"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
