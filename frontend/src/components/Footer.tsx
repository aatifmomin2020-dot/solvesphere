import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div>
          <p className="text-sm font-semibold text-slate-200">
            SolveSphere — Smart India Hackathon Prototype (Problem Statement 26043)
          </p>
          <p className="text-xs text-slate-500 mt-1">
            "From societal problems to measurable solutions."
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role-Based Access Control & Object-Level Authorization Enforced</span>
        </div>
      </div>
    </footer>
  );
};
