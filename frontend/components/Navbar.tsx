"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser, logout, UserProfile } from "@/lib/auth";
import { Globe, Shield, MapPin, User, LogOut, Bell, ChevronDown, CheckCircle } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight">SOLVESPHERE</span>
              <span className="bg-sky-500/20 text-sky-400 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-sky-500/30">
                SIH 26043
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-1 hidden sm:block">
              Problem-to-Project Ecosystem
            </span>
          </div>
        </Link>

        {/* Dynamic Navigation Links based on Role */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/challenges" className="hover:text-sky-400 transition flex items-center gap-1">
            <MapPin className="w-4 h-4 text-sky-400" />
            Explore Challenges
          </Link>

          {user?.role === "CITIZEN" && (
            <>
              <Link href="/citizen/dashboard" className="hover:text-sky-400 transition">My Submissions</Link>
              <Link href="/citizen/report" className="hover:text-sky-400 transition font-bold text-sky-400">Report Problem</Link>
            </>
          )}

          {user?.role === "GOVERNMENT" && (
            <>
              <Link href="/government/dashboard" className="hover:text-amber-400 transition">Gov Dashboard</Link>
              <Link href="/government/challenges" className="hover:text-amber-400 transition">Verification Queue</Link>
              <Link href="/government/impact" className="hover:text-amber-400 transition">Impact Analytics</Link>
            </>
          )}

          {user?.role === "UNIVERSITY" && (
            <>
              <Link href="/university/dashboard" className="hover:text-emerald-400 transition">Uni Portal</Link>
              <Link href="/university/matches" className="hover:text-emerald-400 transition">AI Recommendations</Link>
            </>
          )}

          {user?.role === "INDUSTRY" && (
            <>
              <Link href="/industry/dashboard" className="hover:text-purple-400 transition">Industry Hub</Link>
              <Link href="/industry/opportunities" className="hover:text-purple-400 transition">CSR Marketplace</Link>
            </>
          )}
        </nav>

        {/* User Account & Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href={`/${user.role.toLowerCase()}/dashboard`} className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200">{user.full_name}</span>
                <span className="text-[10px] text-sky-400 font-mono font-semibold uppercase">{user.role}</span>
              </Link>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition"
              >
                Log In
              </Link>
              <Link
                href="/citizen/report"
                className="px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 transition"
              >
                Report Problem
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
