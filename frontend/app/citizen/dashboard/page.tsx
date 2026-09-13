"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { UserCheck, Plus } from "lucide-react";

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
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-sky-700 uppercase">CITIZEN PORTAL</span>
            <h1 className="text-2xl font-black text-slate-900">{user?.full_name || "Citizen Dashboard"}</h1>
            <p className="text-xs text-slate-600">Track reported challenges, view AI scoring, and provide solution feedback.</p>
          </div>
        </div>

        <Link
          href="/citizen/report"
          className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Report New Problem
        </Link>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">My Reported Problems</span>
          <span className="text-3xl font-black text-sky-700">1</span>
          <span className="text-[10px] text-slate-500 block font-mono">SS-1042 Active</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Live Project Stage</span>
          <span className="text-3xl font-black text-amber-600">PROTOTYPE</span>
          <span className="text-[10px] text-amber-700 block font-mono font-semibold">ABC University Accepted</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Community Upvotes</span>
          <span className="text-3xl font-black text-emerald-700">87</span>
          <span className="text-[10px] text-emerald-700 block font-mono font-semibold">Verified Priority: HIGH</span>
        </div>
      </div>

      {/* Reported Challenges List */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
          My Active Civic Submissions
        </h2>

        <div className="space-y-3">
          {challenges.map((ch) => (
            <div key={ch.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {ch.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{ch.title}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1">{ch.location_name} • Category: {ch.category}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-emerald-100 text-emerald-800 font-mono text-xs px-2.5 py-1 rounded font-bold border border-emerald-200">
                  {ch.status}
                </span>

                <Link
                  href={`/citizen/challenges/${ch.id}`}
                  className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1"
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
