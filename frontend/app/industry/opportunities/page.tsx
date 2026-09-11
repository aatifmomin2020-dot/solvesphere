"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { Building, DollarSign, Wrench, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function IndustryOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi("/industry/opportunities")
      .then((data) => setOpportunities(data))
      .catch((err) => console.error(err));

    fetchApi("/industry/recommendations")
      .then((data) => setRecommendations(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-purple-500/30 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-purple-400 uppercase">INDUSTRY OPPORTUNITY MARKETPLACE</span>
            <h1 className="text-2xl font-black text-white">CSR & Technology Support Hub</h1>
            <p className="text-xs text-slate-400">Offer hardware sensors, CSR funding grants, edge platforms, and technical mentorship.</p>
          </div>
        </div>
      </div>

      {/* Available Support Grants */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          Published Corporate Support Opportunities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-purple-500/20 text-purple-300 font-mono text-xs font-bold px-2.5 py-0.5 rounded border border-purple-800">
                  Support: {opp.support_type}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  ₹{opp.budget_inr?.toLocaleString()} Grant
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{opp.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{opp.description}</p>

              <div className="pt-2 flex justify-between items-center border-t border-slate-800 text-xs">
                <span className="text-slate-500">Location: {opp.location}</span>
                <span className="text-emerald-400 font-bold">Status: {opp.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Projects to Join */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
          Verified Projects Seeking Industry Partners
        </h2>

        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.challenge_id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                    {rec.challenge_id}
                  </span>
                  <span className="text-xs font-bold text-white">{rec.title}</span>
                </div>
                <p className="text-xs text-slate-400">{rec.location_name} • Category: {rec.category}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-purple-500/20 text-purple-300 font-mono text-xs font-bold px-2.5 py-1 rounded">
                  {rec.match_score}% Fit
                </span>

                <Link
                  href={`/citizen/challenges/${rec.challenge_id}`}
                  className="px-4 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition"
                >
                  Join Project →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
