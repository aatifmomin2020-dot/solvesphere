"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser, logout, UserProfile } from "@/lib/auth";
import { Language, getTranslation } from "@/lib/i18n";
import { Globe, MapPin, LogOut, Cpu, Languages } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-blue-800 flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-105 transition">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">SOLVESPHERE</span>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-sky-200">
                SIH 26043
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block -mt-1 hidden sm:block">
              {getTranslation(lang, "tagline")}
            </span>
          </div>
        </Link>

        {/* Dynamic Navigation Links based on Role */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/challenges" className="hover:text-sky-700 transition flex items-center gap-1">
            <MapPin className="w-4 h-4 text-sky-600" />
            {getTranslation(lang, "explore_challenges")}
          </Link>

          <Link href="/admin/ai-observability" className="hover:text-purple-700 transition flex items-center gap-1 text-purple-700 font-bold">
            <Cpu className="w-4 h-4 text-purple-600" />
            {getTranslation(lang, "ai_observability")}
          </Link>

          {user?.role === "CITIZEN" && (
            <>
              <Link href="/citizen/dashboard" className="hover:text-sky-700 transition">My Submissions</Link>
              <Link href="/citizen/report" className="hover:text-sky-700 transition font-bold text-sky-700">Report Problem</Link>
            </>
          )}

          {user?.role === "GOVERNMENT" && (
            <>
              <Link href="/government/dashboard" className="hover:text-amber-700 transition">Gov Dashboard</Link>
              <Link href="/government/challenges" className="hover:text-amber-700 transition">Verification Queue</Link>
              <Link href="/government/impact" className="hover:text-amber-700 transition">Impact Analytics</Link>
            </>
          )}

          {user?.role === "UNIVERSITY" && (
            <>
              <Link href="/university/dashboard" className="hover:text-emerald-700 transition">Uni Portal</Link>
              <Link href="/university/matches" className="hover:text-emerald-700 transition">AI Recommendations</Link>
            </>
          )}

          {user?.role === "INDUSTRY" && (
            <>
              <Link href="/industry/dashboard" className="hover:text-purple-700 transition">Industry Hub</Link>
              <Link href="/industry/opportunities" className="hover:text-purple-700 transition">CSR Marketplace</Link>
            </>
          )}
        </nav>

        {/* Language Selector & User Account */}
        <div className="flex items-center gap-3">
          
          {/* Language Picker */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
            <Languages className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-transparent text-slate-700 focus:outline-none cursor-pointer font-bold"
            >
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link href={`/${user.role.toLowerCase()}/dashboard`} className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{user.full_name}</span>
                <span className="text-[10px] text-sky-700 font-mono font-semibold uppercase">{user.role}</span>
              </Link>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-sky-700 transition"
              >
                Log In
              </Link>
              <Link
                href="/citizen/report"
                className="px-4 py-2 rounded-lg text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition"
              >
                {getTranslation(lang, "report_problem")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
