"use client";

import React, { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { BarChart3, TrendingDown, Clock, DollarSign, CheckCircle2, ShieldCheck, Users } from "lucide-react";

export default function ImpactAnalyticsPage() {
  const [impactData, setImpactData] = useState<any>(null);

  useEffect(() => {
    fetchApi("/impact/dashboard")
      .then((data) => setImpactData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8 py-4 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest">
            CLOSED-LOOP IMPACT DASHBOARD
          </span>
          <h1 className="text-2xl font-black text-white">Measurable Civic Impact</h1>
          <p className="text-xs text-slate-400">Comparing pre-project baselines vs post-deployment pilot metrics.</p>
        </div>

        <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Demo Data Label Active</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Incident Reduction</span>
          <span className="text-3xl font-black text-sky-400">76%</span>
          <span className="text-[10px] text-slate-500 block font-mono">500 → 120 / month</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Avg Response Time</span>
          <span className="text-3xl font-black text-emerald-400">12 hrs</span>
          <span className="text-[10px] text-slate-500 block font-mono">Reduced from 72 hrs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Annual Cost Savings</span>
          <span className="text-3xl font-black text-amber-400">₹3.8 Lakhs</span>
          <span className="text-[10px] text-slate-500 block font-mono">Per Pilot Ward</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Citizen Satisfaction</span>
          <span className="text-3xl font-black text-purple-400">94.0%</span>
          <span className="text-[10px] text-slate-500 block font-mono">Verified Post-Pilot Feedback</span>
        </div>
      </div>

      {/* COMPARATIVE BEFORE & AFTER CHARTS */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            Before vs After Solution Deployment
          </h2>
          <span className="text-xs font-mono text-slate-400">Main Scenario: SS-1042 ABC School Flood Monitoring</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Monthly Incidents Comparison */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Monthly Waterlogging Incidents</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-400 font-bold">BEFORE PROJECT DEPLOYMENT</span>
                  <span className="font-mono text-rose-400 font-bold">500 Incidents / mo</span>
                </div>
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-bold">AFTER SOLVESPHERE PILOT</span>
                  <span className="font-mono text-emerald-400 font-bold">120 Incidents / mo</span>
                </div>
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "24%" }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs flex items-center justify-between font-mono">
              <span>Net Incident Reduction:</span>
              <span className="font-black text-sm">76.0% Drop</span>
            </div>
          </div>

          {/* Municipal Maintenance Cost Comparison */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Municipal Repair Expenditure</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-400 font-bold">BEFORE (Manual Pumping Costs)</span>
                  <span className="font-mono text-rose-400 font-bold">₹5,00,000 / yr</span>
                </div>
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-sky-400 font-bold">AFTER (Automated IoT Sluice Gates)</span>
                  <span className="font-mono text-sky-400 font-bold">₹1,20,000 / yr</span>
                </div>
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: "24%" }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-sky-950/40 border border-sky-800/60 rounded-lg text-sky-300 text-xs flex items-center justify-between font-mono">
              <span>Annual Taxpayer Savings:</span>
              <span className="font-black text-sm">₹3,80,000 Saved</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
