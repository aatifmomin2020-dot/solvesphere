"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { UserCheck, Plus, CheckCircle2, Clock, ThumbsUp, ArrowRight } from "lucide-react";

export default function CitizenDashboard() {
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    setUser(getCurrentUser());
    fetchApi("/challenges")
      .then((data) => setChallenges(data.slice(0, 5)))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8 py-4">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-sky-400 uppercase">CITIZEN PORTAL</span>
            <h1 className="text-2xl font-black text-white">{user?.full_name || "Citizen Dashboard"}</h1>
            <p className="text-xs text-slate-400">Track reported challenges, view AI scoring, and provide solution feedback.</p>
          </div>
        </div>

        <Link
          href="/citizen/report"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-black transition shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Report New Problem
        </Link>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">My Reported Problems</span>
          <span className="text-3xl font-black text-sky-400">1</span>
          <span className="text-[10px] text-slate-500 block font-mono">SS-1042 Active</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Live Project Stage</span>
          <span className="text-3xl font-black text-amber-400">PROTOTYPE</span>
          <span className="text-[10px] text-amber-300/80 block font-mono">ABC University Accepted</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Community Upvotes</span>
          <span className="text-3xl font-black text-emerald-400">87</span>
          <span className="text-[10px] text-emerald-300/80 block font-mono">Verified Priority: HIGH</span>
        </div>
      </div>

      {/* Reported Challenges List */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          My Active Civic Submissions
        </h2>

        <div className="space-y-3">
          {challenges.map((ch) => (
            <div key={ch.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                    {ch.id}
                  </span>
                  <span className="text-xs font-bold text-white">{ch.title}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{ch.location_name} • Category: {ch.category}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-1 rounded font-bold">
                  {ch.status}
                </span>

                <Link
                  href={`/citizen/challenges/${ch.id}`}
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  Track →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
