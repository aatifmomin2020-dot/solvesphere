"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import EcosystemFlow from "@/components/EcosystemFlow";
import InteractiveMap from "@/components/InteractiveMap";
import { 
  Globe, ArrowRight, Users, Building2, GraduationCap, 
  Building, Sparkles, CheckCircle2, Search
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function LandingPage() {
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    fetchApi("/challenges")
      .then((data) => setChallenges(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 py-4">
      
      {/* HERO SECTION */}
      <section className="relative text-center max-w-4xl mx-auto pt-8 pb-12 space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>SIH 2026 Problem Statement 26043 Prototype</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          SOLVESPHERE
        </h1>

        <p className="text-xl sm:text-2xl font-bold gradient-text">
          "From societal problems to measurable solutions."
        </p>

        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Connect citizens, government, universities and industry to turn real-world challenges into validated, collaborative and deployable solutions.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/citizen/report"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-white bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Report a Problem
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/challenges"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-sky-600" />
            Explore Challenges
          </Link>
        </div>
      </section>

      {/* ECOSYSTEM VISUAL PIPELINE */}
      <section>
        <div className="text-center mb-4">
          <h2 className="text-xs font-mono font-bold text-sky-700 uppercase tracking-widest">
            The Closed-Loop Ecosystem
          </h2>
        </div>
        <EcosystemFlow activeStage="MATCH" />
      </section>

      {/* FOUR STAKEHOLDER CARDS */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Four Stakeholders • One Unified Platform
          </h2>
          <p className="text-sm text-slate-600">
            Enforcing cross-sector collaboration with granular Role-Based Access Control (RBAC).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Citizen */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-sky-500 hover:shadow-md transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">1. CITIZEN</h3>
              <p className="text-xs text-sky-700 font-semibold mb-3">"Report problems & track solutions"</p>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Submit challenges & evidence</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Track live project progress</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Provide post-pilot feedback</li>
              </ul>
            </div>
            <Link href="/citizen/report" className="mt-6 text-xs font-bold text-sky-600 flex items-center gap-1 group-hover:translate-x-1 transition">
              Report Challenge →
            </Link>
          </div>

          {/* Government */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-amber-500 hover:shadow-md transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">2. GOVERNMENT</h3>
              <p className="text-xs text-amber-700 font-semibold mb-3">"Validate challenges & drive deployment"</p>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Verify AI priority scores</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Approve field pilots</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Monitor impact analytics</li>
              </ul>
            </div>
            <Link href="/government/challenges" className="mt-6 text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition">
              Gov Verification Queue →
            </Link>
          </div>

          {/* University */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">3. UNIVERSITY</h3>
              <p className="text-xs text-emerald-700 font-semibold mb-3">"Turn problems into research projects"</p>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> AI expertise matching</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Faculty & student team execution</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Deliver hardware & software MVPs</li>
              </ul>
            </div>
            <Link href="/university/matches" className="mt-6 text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition">
              AI Recommendations →
            </Link>
          </div>

          {/* Industry */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between hover:border-purple-500 hover:shadow-md transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">4. INDUSTRY / CSR</h3>
              <p className="text-xs text-purple-700 font-semibold mb-3">"Provide technology, funding & mentorship"</p>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> CSR funding & hardware support</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Technical mentorship & guidance</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> Scale successful pilots</li>
              </ul>
            </div>
            <Link href="/industry/opportunities" className="mt-6 text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition">
              CSR Marketplace →
            </Link>
          </div>
        </div>
      </section>

      {/* INTERACTIVE GEOSPATIAL MAP & FEATURED CHALLENGES */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Live Challenge Map & Priority Radar</h2>
            <p className="text-xs text-slate-600">Real-time civic challenges classified by SBERT AI embeddings and Priority Scoring.</p>
          </div>

          <Link href="/challenges" className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1">
            View All 20 Challenges →
          </Link>
        </div>

        <InteractiveMap challenges={challenges} />
      </section>

      {/* MAIN SIH DEMO CHALLENGE SHOWCASE: SS-1042 */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-sky-600 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                MAIN DEMO SCENARIO • SS-1042
              </span>
              <span className="bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold px-2.5 py-0.5 rounded">
                HIGH PRIORITY
              </span>
            </div>

            <h3 className="text-2xl font-black text-slate-900">
              Urban Waterlogging Near ABC School
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              "During heavy rainfall, severe water accumulation occurs near ABC School. Students and residents face difficulty accessing the road."
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-xs font-mono">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Domain:</span>
                <span className="font-bold text-sky-700">Environment</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Priority Score:</span>
                <span className="font-bold text-amber-700">85.5 / 100</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">People Affected:</span>
                <span className="font-bold text-slate-800">2,450 Citizens</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Uni Match:</span>
                <span className="font-bold text-emerald-700">94% Match</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Demo Execution Workflow</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1. Citizen Reported & AI Classified</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>2. Government Officers Verified</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>3. ABC University (94%) Accepted</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>4. SmartCity Tech (87%) Joined</span>
              </div>
            </div>

            <Link
              href="/projects/SS-P-1042"
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-black text-xs text-center transition shadow-md shadow-sky-600/20 block mt-2"
            >
              Open Live Project Workspace →
            </Link>
          </div>
        </div>
      </section>

      {/* IMPACT METRICS SNAPSHOT */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Closed-Loop Impact Dashboard</h2>
            <p className="text-xs text-slate-600">Empirical before-and-after resolution tracking across municipal sectors.</p>
          </div>
          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-mono px-2.5 py-1 rounded font-semibold">
            Demo Data Label
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-3xl font-black text-sky-700">76%</span>
            <span className="text-xs text-slate-600 block mt-1 font-medium">Flood Incident Reduction</span>
            <span className="text-[10px] text-slate-500 block font-mono">500 → 120 / month</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-3xl font-black text-emerald-700">83%</span>
            <span className="text-xs text-slate-600 block mt-1 font-medium">Faster Response Time</span>
            <span className="text-[10px] text-slate-500 block font-mono">72h → 12h average</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-3xl font-black text-amber-700">24,500+</span>
            <span className="text-xs text-slate-600 block mt-1 font-medium">Citizens Benefited</span>
            <span className="text-[10px] text-slate-500 block font-mono">Across 5 Pilot Sectors</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-3xl font-black text-purple-700">94.0%</span>
            <span className="text-xs text-slate-600 block mt-1 font-medium">Citizen Satisfaction</span>
            <span className="text-[10px] text-slate-500 block font-mono">Verified Post-Pilot Feedback</span>
          </div>
        </div>
      </section>

    </div>
  );
}
