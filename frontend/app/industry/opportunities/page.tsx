"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { Building } from "lucide-react";

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
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-purple-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-purple-700 uppercase">INDUSTRY OPPORTUNITY MARKETPLACE</span>
            <h1 className="text-2xl font-black text-slate-900">CSR & Technology Support Hub</h1>
            <p className="text-xs text-slate-600">Offer hardware sensors, CSR funding grants, edge platforms, and technical mentorship.</p>
          </div>
        </div>
      </div>

      {/* Available Support Grants */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
          Published Corporate Support Opportunities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-purple-100 text-purple-800 font-mono text-xs font-bold px-2.5 py-0.5 rounded border border-purple-200">
                  Support: {opp.support_type}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-700">
                  ₹{opp.budget_inr?.toLocaleString()} Grant
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{opp.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{opp.description}</p>

              <div className="pt-2 flex justify-between items-center border-t border-slate-200 text-xs">
                <span className="text-slate-500">Location: {opp.location}</span>
                <span className="text-emerald-700 font-bold">Status: {opp.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Projects to Join */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
          Verified Projects Seeking Industry Partners
        </h2>

        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.challenge_id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {rec.challenge_id}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                </div>
                <p className="text-xs text-slate-600">{rec.location_name} • Category: {rec.category}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-purple-100 text-purple-800 font-mono text-xs font-bold px-2.5 py-1 rounded border border-purple-200">
                  {rec.match_score}% Fit
                </span>

                <Link
                  href={`/citizen/challenges/${rec.challenge_id}`}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
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
