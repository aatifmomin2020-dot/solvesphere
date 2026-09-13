import React from 'react';
import { Shield, Sparkles, Building2, GraduationCap, Users } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="bg-brand-600 text-white p-2 rounded-xl shadow-md flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              SOLVESPHERE
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                SIH 26043
              </span>
            </span>
            <p className="text-xs text-slate-500 hidden sm:block">Societal Problems → Measurable Solutions</p>
          </div>
        </div>

        {/* Stakeholder Badges */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
          <span className="flex items-center space-x-1.5 hover:text-brand-600 transition">
            <Users className="w-4 h-4 text-sky-500" />
            <span>Citizen</span>
          </span>
          <span className="flex items-center space-x-1.5 hover:text-brand-600 transition">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>Government</span>
          </span>
          <span className="flex items-center space-x-1.5 hover:text-brand-600 transition">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            <span>University</span>
          </span>
          <span className="flex items-center space-x-1.5 hover:text-brand-600 transition">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>Industry</span>
          </span>
        </div>

        {/* Demo Action */}
        <div className="flex items-center space-x-3">
          <a
            href="#demo-section"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition"
          >
            Launch Demo Portal
          </a>
        </div>
      </div>
    </header>
  );
};
