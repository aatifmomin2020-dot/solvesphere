import React from 'react';
import { Users, Shield, GraduationCap, Building2, Sparkles } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: string;
  onSelectRole: (role: string) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onSelectRole }) => {
  const roles = [
    { id: 'CITIZEN', label: 'Citizen', icon: Users, color: 'bg-sky-500 hover:bg-sky-600 text-white' },
    { id: 'GOVERNMENT', label: 'Government', icon: Shield, color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    { id: 'UNIVERSITY', label: 'University', icon: GraduationCap, color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { id: 'INDUSTRY', label: 'Industry', icon: Building2, color: 'bg-amber-600 hover:bg-amber-700 text-white' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>SIH Judge Demo Switcher</span>
        </div>

        <div className="flex items-center space-x-2">
          {roles.map((r) => {
            const Icon = r.icon;
            const active = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                  active
                    ? `${r.color} ring-2 ring-white/40 shadow-lg scale-105`
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
