"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import EcosystemFlow from "@/components/EcosystemFlow";
import InteractiveMap from "@/components/InteractiveMap";
import { 
  Globe, ArrowRight, Shield, Users, Building2, GraduationCap, 
  Building, Sparkles, CheckCircle2, Cpu, BarChart3, Rocket, MapPin, Search, ChevronRight
} from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function LandingPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [impactData, setImpactData] = useState<any>(null);

  useEffect(() => {
    fetchApi("/challenges")
      .then((data) => setChallenges(data))
      .catch(() => {});

    fetchApi("/impact/dashboard")
      .then((data) => setImpactData(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-16 py-4">
      
      {/* HERO SECTION */}
      <section className="relative text-center max-w-4xl mx-auto pt-8 pb-12 space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>SIH 2026 Problem Statement 26043 Prototype</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          SOLVESPHERE
        </h1>

        <p className="text-xl sm:text-2xl font-bold gradient-text">
          "From societal problems to measurable solutions."
        </p>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Connect citizens, government, universities and industry to turn real-world challenges into validated, collaborative and deployable solutions.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/citizen/report"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-xl shadow-sky-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Report a Problem
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/challenges"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 hover:text-white transition flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-sky-400" />
            Explore Challenges
          </Link>
        </div>
      </section>

      {/* ECOSYSTEM VISUAL PIPELINE */}
      <section>
        <div className="text-center mb-4">
          <h2 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
            The Closed-Loop Ecosystem
          </h2>
        </div>
        <EcosystemFlow activeStage="MATCH" />
      </section>

      {/* FOUR STAKEHOLDER CARDS */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Four Stakeholders • One Unified Platform
          </h2>
          <p className="text-sm text-slate-400">
            Enforcing cross-sector collaboration with granular Role-Based Access Control (RBAC).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Citizen */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-sky-500/50 transition group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. CITIZEN</h3>
              <p className="text-xs text-sky-400 font-medium mb-3">"Report problems & track solutions"</p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Submit challenges & evidence</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Track live project progress</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Provide post-pilot feedback</li>
              </ul>
            </div>
            <Link href="/citizen/report" className="mt-6 text-xs font-bold text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              Report Challenge →
            </Link>
          </div>

          {/* Government */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-amber-500/50 transition group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. GOVERNMENT</h3>
              <p className="text-xs text-amber-400 font-medium mb-3">"Validate challenges & drive deployment"</p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Verify AI priority scores</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Approve field pilots</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Monitor impact analytics</li>
              </ul>
            </div>
            <Link href="/government/challenges" className="mt-6 text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              Gov Verification Queue →
            </Link>
          </div>

          {/* University */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-500/50 transition group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. UNIVERSITY</h3>
              <p className="text-xs text-emerald-400 font-medium mb-3">"Turn problems into research projects"</p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI expertise matching</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Faculty & student team execution</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Deliver hardware & software MVPs</li>
              </ul>
            </div>
            <Link href="/university/matches" className="mt-6 text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              AI Recommendations →
            </Link>
          </div>

          {/* Industry */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-purple-500/50 transition group shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. INDUSTRY / CSR</h3>
              <p className="text-xs text-purple-400 font-medium mb-3">"Provide technology, funding & mentorship"</p>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> CSR funding & hardware support</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Technical mentorship & guidance</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Scale successful pilots</li>
              </ul>
            </div>
            <Link href="/industry/opportunities" className="mt-6 text-xs font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              CSR Marketplace →
            </Link>
          </div>
        </div>
      </section>

      {/* INTERACTIVE GEOSPATIAL MAP & FEATURED CHALLENGES */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Live Challenge Map & Priority Radar</h2>
            <p className="text-xs text-slate-400">Real-time civic challenges classified by SBERT AI embeddings and Priority Scoring.</p>
          </div>

          <Link href="/challenges" className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1">
            View All 20 Challenges →
          </Link>
        </div>

        <InteractiveMap challenges={challenges} />
      </section>

      {/* MAIN SIH DEMO CHALLENGE SHOWCASE: SS-1042 */}
      <section className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-800/40 p-6 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -z-0" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-sky-500 text-slate-950 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                MAIN DEMO SCENARIO • SS-1042
              </span>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold px-2.5 py-0.5 rounded">
                HIGH PRIORITY
              </span>
            </div>

            <h3 className="text-2xl font-black text-white">
              Urban Waterlogging Near ABC School
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              "During heavy rainfall, severe water accumulation occurs near ABC School. Students and residents face difficulty accessing the road."
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 text-xs font-mono">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Domain:</span>
                <span className="font-bold text-sky-300">Environment</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Priority Score:</span>
                <span className="font-bold text-amber-400">85.5 / 100</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">People Affected:</span>
                <span className="font-bold text-slate-200">2,450 Citizens</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Uni Match:</span>
                <span className="font-bold text-emerald-400">94% Match</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-slate-950/90 p-5 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Demo Execution Workflow</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1. Citizen Reported & AI Classified</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>2. Government Officers Verified</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>3. ABC University (94%) Accepted</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>4. SmartCity Tech (87%) Joined</span>
              </div>
            </div>

            <Link
              href="/projects/SS-P-1042"
              className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs text-center transition block shadow-lg mt-2"
            >
              Open Live Project Workspace →
            </Link>
          </div>
        </div>
      </section>

      {/* IMPACT METRICS SNAPSHOT */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Closed-Loop Impact Dashboard</h2>
            <p className="text-xs text-slate-400">Empirical before-and-after resolution tracking across municipal sectors.</p>
          </div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono px-2.5 py-1 rounded">
            Demo Data Label
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-3xl font-black text-sky-400">76%</span>
            <span className="text-xs text-slate-400 block mt-1 font-medium">Flood Incident Reduction</span>
            <span className="text-[10px] text-slate-500 block font-mono">500 → 120 / month</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-3xl font-black text-emerald-400">83%</span>
            <span className="text-xs text-slate-400 block mt-1 font-medium">Faster Response Time</span>
            <span className="text-[10px] text-slate-500 block font-mono">72h → 12h average</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-3xl font-black text-amber-400">24,500+</span>
            <span className="text-xs text-slate-400 block mt-1 font-medium">Citizens Benefited</span>
            <span className="text-[10px] text-slate-500 block font-mono">Across 5 Pilot Sectors</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-3xl font-black text-purple-400">94.0%</span>
            <span className="text-xs text-slate-400 block mt-1 font-medium">Citizen Satisfaction</span>
            <span className="text-[10px] text-slate-500 block font-mono">Verified Post-Pilot Feedback</span>
          </div>
        </div>
      </section>

    </div>
  );
}
