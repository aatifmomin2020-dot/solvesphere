"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { Building, DollarSign, Wrench, CheckCircle2, ArrowRight } from "lucide-react";

export default function IndustryDashboard() {
  const [user, setUser] = useState<any>(null);
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    setUser(getCurrentUser());
    fetchApi("/industry/organizations")
      .then((data) => setOrgs(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-8 py-4">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-purple-500/30 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-purple-400 uppercase">INDUSTRY HUB</span>
            <h1 className="text-2xl font-black text-white">{user?.full_name || "SmartCity Technologies"}</h1>
            <p className="text-xs text-slate-400">Offer hardware sensors, technical mentorship, and pilot deployment backing.</p>
          </div>
        </div>

        <Link
          href="/industry/opportunities"
          className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-black transition shadow-lg flex items-center gap-2"
        >
          CSR Marketplace & Grants →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Available CSR Grant Fund</span>
          <span className="text-3xl font-black text-emerald-400">₹5,00,000</span>
          <span className="text-[10px] text-slate-500 block font-mono">Sanctioned for Smart City IoT</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Supported Project Pilots</span>
          <span className="text-3xl font-black text-sky-400">1 Active</span>
          <span className="text-[10px] text-slate-500 block font-mono">SS-P-1042 Flood Gateway</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium">Active Support Types</span>
          <span className="text-3xl font-black text-purple-400">4 Offerings</span>
          <span className="text-[10px] text-slate-500 block font-mono">Hardware, Mentorship, Pilot, Tech</span>
        </div>
      </div>

    </div>
  );
}
