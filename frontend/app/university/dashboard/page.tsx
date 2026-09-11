"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { GraduationCap, Users, BookOpen, CheckCircle2, ArrowRight } from "lucide-react";

export default function UniversityDashboard() {
  const [user, setUser] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);

  useEffect(() => {
    setUser(getCurrentUser());
    fetchApi("/universities/teams")
      .then((data) => setTeams(data))
      .catch((err) => console.error(err));
    fetchApi("/universities/faculty")
      .then((data) => setFaculty(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8 py-4">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-emerald-500/30 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">UNIVERSITY PORTAL</span>
            <h1 className="text-2xl font-black text-white">{user?.full_name || "ABC Institute of Technology"}</h1>
            <p className="text-xs text-slate-400">Faculty research guidance, student engineering teams, and project milestone delivery.</p>
          </div>
        </div>

        <Link
          href="/university/matches"
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-lg flex items-center gap-2"
        >
          View AI Recommendations (94% Match)
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Teams */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Registered Student Engineering Teams
          </h2>

          <div className="space-y-3">
            {teams.map((t) => (
              <div key={t.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-200">{t.team_name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                    {t.member_count} Members
                  </span>
                </div>
                <p className="text-xs text-slate-400">Department: {t.department}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {t.skills?.map((s: string, sIdx: number) => (
                    <span key={sIdx} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Advisors */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            Faculty Advisors & Research Expertise
          </h2>

          <div className="space-y-3">
            {faculty.map((f) => (
              <div key={f.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-200">{f.name}</span>
                  <span className="text-[10px] font-mono text-sky-400">{f.department}</span>
                </div>
                <p className="text-[11px] text-slate-400">Expertise: {f.expertise?.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
