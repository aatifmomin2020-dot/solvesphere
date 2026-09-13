"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { Building } from "lucide-react";

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
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-purple-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-purple-700 uppercase">INDUSTRY HUB</span>
            <h1 className="text-2xl font-black text-slate-900">{user?.full_name || "SmartCity Technologies"}</h1>
            <p className="text-xs text-slate-600">Offer hardware sensors, technical mentorship, and pilot deployment backing.</p>
          </div>
        </div>

        <Link
          href="/industry/opportunities"
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition shadow-md flex items-center gap-2"
        >
          CSR Marketplace & Grants →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Available CSR Grant Fund</span>
          <span className="text-3xl font-black text-emerald-700">₹5,00,000</span>
          <span className="text-[10px] text-slate-500 block font-mono">Sanctioned for Smart City IoT</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Supported Project Pilots</span>
          <span className="text-3xl font-black text-sky-700">1 Active</span>
          <span className="text-[10px] text-slate-500 block font-mono">SS-P-1042 Flood Gateway</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Active Support Types</span>
          <span className="text-3xl font-black text-purple-700">4 Offerings</span>
          <span className="text-[10px] text-slate-500 block font-mono">Hardware, Mentorship, Pilot, Tech</span>
        </div>
      </div>

    </div>
  );
}
