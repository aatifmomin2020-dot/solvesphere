"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Globe, UserCheck, Building2, GraduationCap, Building, Sparkles, Lock, Mail } from "lucide-react";

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
        <div className="inline-flex p-3 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 mb-2">
          <Globe className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign In to SolveSphere</h1>
        <p className="text-xs text-slate-500">Problem-to-Project Ecosystem • SIH 26043</p>
      </div>

      {/* ONE-CLICK DEMO MODE SECTION */}
      <div className="bg-white border border-sky-200 rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              1-Click Demo Mode (SIH Presentation)
            </span>
          </div>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-200">
            DEMO ACCOUNT
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Instant authentication with pre-seeded demo accounts & realistic SIH data:
        </p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handleDemoClick("CITIZEN")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 transition group"
          >
            <UserCheck className="w-5 h-5 text-sky-600 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-900">Citizen Persona</span>
            <span className="text-[10px] text-slate-500">Report & Track</span>
          </button>

          <button
            onClick={() => handleDemoClick("GOVERNMENT")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 transition group"
          >
            <Building2 className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-900">Government Persona</span>
            <span className="text-[10px] text-slate-500">Verify & Pilot</span>
          </button>

          <button
            onClick={() => handleDemoClick("UNIVERSITY")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 transition group"
          >
            <GraduationCap className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-900">University Persona</span>
            <span className="text-[10px] text-slate-500">Match & Build</span>
          </button>

          <button
            onClick={() => handleDemoClick("INDUSTRY")}
            disabled={loading}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 transition group"
          >
            <Building className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-900">Industry Persona</span>
            <span className="text-[10px] text-slate-500">CSR & Mentorship</span>
          </button>
        </div>
      </div>

      {/* STANDARD LOGIN FORM */}
      <form onSubmit={handleStandardLogin} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Or Login with Credentials</h3>
        
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@solvesphere.gov.in"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold bg-sky-600 hover:bg-sky-700 text-white text-xs transition shadow-md flex items-center justify-center gap-2"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>

    </div>
  );
}
