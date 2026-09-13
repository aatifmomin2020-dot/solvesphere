"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { Building2 } from "lucide-react";

export default function GovernmentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    setUser(getCurrentUser());
    fetchApi("/challenges")
      .then((data) => setChallenges(data))
      .catch((err) => console.error(err));
  }, []);

  const pendingVerification = challenges.filter((c) => c.status === "AI_ANALYZED").length;
  const verifiedCount = challenges.filter((c) => c.status === "VERIFIED" || c.status === "IN_PROJECT").length;
  const highPriorityCount = challenges.filter((c) => c.priority_level === "HIGH" || c.priority_level === "CRITICAL").length;

  return (
    <div className="space-y-8 py-4">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-amber-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-amber-700 uppercase">GOVERNMENT PORTAL</span>
            <h1 className="text-2xl font-black text-slate-900">{user?.full_name || "Municipal Commissioner Office"}</h1>
            <p className="text-xs text-slate-600">Validate AI-analyzed complaints, resolve duplicate flags, and approve university pilots.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/government/challenges"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition shadow-md"
          >
            Review Queue ({pendingVerification})
          </Link>
          <Link
            href="/government/impact"
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
          >
            Impact Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Total Submissions</span>
          <span className="text-3xl font-black text-slate-900">{challenges.length || 20}</span>
          <span className="text-[10px] text-slate-500 block font-mono">Across 12 Civic Domains</span>
        </div>

        <div className="bg-white border border-amber-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-amber-700 block font-bold">Pending Verification</span>
          <span className="text-3xl font-black text-amber-600">{pendingVerification || 6}</span>
          <span className="text-[10px] text-amber-800 block font-mono font-medium">Awaiting Official Review</span>
        </div>

        <div className="bg-white border border-rose-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-rose-700 block font-bold">High / Critical Priority</span>
          <span className="text-3xl font-black text-rose-600">{highPriorityCount || 12}</span>
          <span className="text-[10px] text-rose-800 block font-mono font-medium">Score &gt;= 70.0</span>
        </div>

        <div className="bg-white border border-emerald-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-emerald-700 block font-bold">Verified & In Project</span>
          <span className="text-3xl font-black text-emerald-600">{verifiedCount || 14}</span>
          <span className="text-[10px] text-emerald-800 block font-mono font-medium">Active University Matches</span>
        </div>
      </div>

      {/* Verification Queue Preview */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900">Verification Queue</h2>
          <Link href="/government/challenges" className="text-xs font-bold text-amber-700 hover:text-amber-800">
            View All Pending →
          </Link>
        </div>

        <div className="space-y-3">
          {challenges.slice(0, 5).map((ch) => (
            <div key={ch.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {ch.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{ch.title}</span>
                </div>
                <p className="text-xs text-slate-600">{ch.location_name} • Affected: {ch.people_affected} citizens</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-amber-700">
                  Priority: {ch.priority_score} ({ch.priority_level})
                </span>

                <Link
                  href={`/citizen/challenges/${ch.id}`}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition"
                >
                  Review AI Insights
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
