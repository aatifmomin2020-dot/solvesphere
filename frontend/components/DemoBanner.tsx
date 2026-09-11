"use client";

import React, { useState, useEffect } from "react";
import { getCurrentUser, demoLogin, UserProfile } from "@/lib/auth";
import { ShieldAlert, UserCheck, Building2, GraduationCap, Building, RefreshCw } from "lucide-react";

export default function DemoBanner() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleSwitchRole = async (role: string) => {
    setLoadingRole(role);
    try {
      const u = await demoLogin(role);
      setUser(u);
      // redirect to role dashboard
      const routeMap: Record<string, string> = {
        CITIZEN: "/citizen/dashboard",
        GOVERNMENT: "/government/dashboard",
        UNIVERSITY: "/university/dashboard",
        INDUSTRY: "/industry/dashboard"
      };
      window.location.href = routeMap[role] || "/";
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-50">
      <div className="flex items-center gap-2 font-medium">
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold tracking-wider">
          SIH DEMO MODE
        </span>
        <span className="hidden md:inline text-slate-400">
          Problem Statement 26043 • Active Persona:
        </span>
        {user ? (
          <span className="font-bold text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded">
            {user.role} ({user.full_name})
          </span>
        ) : (
          <span className="text-slate-400 italic">Not Logged In</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">1-Click Switch:</span>
        
        <button
          onClick={() => handleSwitchRole("CITIZEN")}
          disabled={loadingRole !== null}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition text-slate-200 font-medium ${
            user?.role === "CITIZEN" ? "bg-sky-600 text-white font-bold ring-1 ring-sky-300" : "bg-slate-800 hover:bg-slate-700"
          }`}
        >
          <UserCheck className="w-3 h-3 text-sky-400" />
          Citizen
        </button>

        <button
          onClick={() => handleSwitchRole("GOVERNMENT")}
          disabled={loadingRole !== null}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition text-slate-200 font-medium ${
            user?.role === "GOVERNMENT" ? "bg-amber-600 text-white font-bold ring-1 ring-amber-300" : "bg-slate-800 hover:bg-slate-700"
          }`}
        >
          <Building2 className="w-3 h-3 text-amber-400" />
          Government
        </button>

        <button
          onClick={() => handleSwitchRole("UNIVERSITY")}
          disabled={loadingRole !== null}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition text-slate-200 font-medium ${
            user?.role === "UNIVERSITY" ? "bg-emerald-600 text-white font-bold ring-1 ring-emerald-300" : "bg-slate-800 hover:bg-slate-700"
          }`}
        >
          <GraduationCap className="w-3 h-3 text-emerald-400" />
          University
        </button>

        <button
          onClick={() => handleSwitchRole("INDUSTRY")}
          disabled={loadingRole !== null}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition text-slate-200 font-medium ${
            user?.role === "INDUSTRY" ? "bg-purple-600 text-white font-bold ring-1 ring-purple-300" : "bg-slate-800 hover:bg-slate-700"
          }`}
        >
          <Building className="w-3 h-3 text-purple-400" />
          Industry
        </button>

        {loadingRole && <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin ml-1" />}
      </div>
    </div>
  );
}
