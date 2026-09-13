import React from "react";
import Link from "next/link";
import { Globe, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">SOLVESPHERE</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              From societal problems to measurable solutions. Connect citizens, government, universities, and industry.
            </p>
            <span className="inline-block bg-slate-100 border border-slate-200 text-sky-800 font-mono text-[10px] px-2 py-1 rounded">
              SIH Problem Statement 26043
            </span>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Stakeholders</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/citizen/dashboard" className="hover:text-sky-600 transition">Citizen Portal</Link></li>
              <li><Link href="/government/dashboard" className="hover:text-amber-600 transition">Government Validation</Link></li>
              <li><Link href="/university/dashboard" className="hover:text-emerald-600 transition">University Research & Teams</Link></li>
              <li><Link href="/industry/dashboard" className="hover:text-purple-600 transition">Industry & CSR Marketplace</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/challenges" className="hover:text-sky-600 transition">Challenge Discovery Map</Link></li>
              <li><Link href="/citizen/report" className="hover:text-sky-600 transition">AI Priority Scoring</Link></li>
              <li><Link href="/government/impact" className="hover:text-sky-600 transition">Closed-loop Impact Metrics</Link></li>
              <li><Link href="/login" className="hover:text-sky-600 transition">One-Click Demo Mode</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Smart India Hackathon</h4>
            <p className="text-slate-500 leading-relaxed mb-3">
              Designed & built for live hackathon demonstration with complete end-to-end working APIs and PostgreSQL storage.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Stack Production MVP</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 SolveSphere • Smart India Hackathon Prototype 26043.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for civic innovation.
          </p>
        </div>
      </div>
    </footer>
  );
}
