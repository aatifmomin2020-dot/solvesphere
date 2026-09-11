"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { demoLogin, fetchApi } from "@/lib/api";
import { Globe, UserCheck, Building2, GraduationCap, Building, Sparkles, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("solvesphere_token", data.access_token);
      localStorage.setItem("solvesphere_user", JSON.stringify(data.user));
      
      const roleMap: Record<string, string> = {
        CITIZEN: "/citizen/dashboard",
        GOVERNMENT: "/government/dashboard",
        UNIVERSITY: "/university/dashboard",
        INDUSTRY: "/industry/dashboard"
      };
      router.push(roleMap[data.user.role] || "/");
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi(`/auth/demo-login?role=${role}`, { method: "POST" });
      localStorage.setItem("solvesphere_token", data.access_token);
      localStorage.setItem("solvesphere_user", JSON.stringify(data.user));

      const roleMap: Record<string, string> = {
        CITIZEN: "/citizen/dashboard",
        GOVERNMENT: "/government/dashboard",
        UNIVERSITY: "/university/dashboard",
        INDUSTRY: "/industry/dashboard"
      };
      window.location.href = roleMap[role] || "/";
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-2">
          <Globe className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white">Sign In to SolveSphere</h1>
        <p className="text-xs text-slate-400">Problem-to-Project Ecosystem • SIH 26043</p>
      </div>

      {/* ONE-CLICK DEMO MODE SECTION */}
      <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
              1-Click Demo Mode (SIH Presentation)
            </span>
          </div>
          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
            DEMO ACCOUNT
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Instant authentication with pre-seeded demo accounts & realistic SIH data:
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handleDemoClick("CITIZEN")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 hover:bg-sky-950/60 border border-slate-800 hover:border-sky-500 text-slate-200 transition group"
          >
            <UserCheck className="w-5 h-5 text-sky-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-white">Citizen Persona</span>
            <span className="text-[10px] text-slate-400">Report & Track</span>
          </button>

          <button
            onClick={() => handleDemoClick("GOVERNMENT")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500 text-slate-200 transition group"
          >
            <Building2 className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-white">Government Persona</span>
            <span className="text-[10px] text-slate-400">Verify & Pilot</span>
          </button>

          <button
            onClick={() => handleDemoClick("UNIVERSITY")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500 text-slate-200 transition group"
          >
            <GraduationCap className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-white">University Persona</span>
            <span className="text-[10px] text-slate-400">Match & Build</span>
          </button>

          <button
            onClick={() => handleDemoClick("INDUSTRY")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500 text-slate-200 transition group"
          >
            <Building className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-white">Industry Persona</span>
            <span className="text-[10px] text-slate-400">CSR & Mentorship</span>
          </button>
        </div>
      </div>

      {/* STANDARD LOGIN FORM */}
      <form onSubmit={handleStandardLogin} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">Or Login with Credentials</h3>
        
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@solvesphere.gov.in"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold bg-sky-600 hover:bg-sky-500 text-white text-xs transition shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>

    </div>
  );
}
