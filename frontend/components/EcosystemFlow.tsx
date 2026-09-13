"use client";

import React from "react";
import { Send, Cpu, CheckCircle2, GitMerge, Users, Rocket, BarChart3, ChevronRight } from "lucide-react";

interface EcosystemFlowProps {
  activeStage?: string;
}

const STAGES = [
  { id: "SUBMIT", label: "Citizen Problem", desc: "Report challenge", icon: Send, color: "text-sky-600 bg-sky-100/80" },
  { id: "ANALYZE", label: "AI Pipeline", desc: "Domain + Priority + Duplicates", icon: Cpu, color: "text-purple-600 bg-purple-100/80" },
  { id: "VERIFY", label: "Government Review", desc: "Validation & Scoping", icon: CheckCircle2, color: "text-amber-600 bg-amber-100/80" },
  { id: "MATCH", label: "Uni + Industry AI", desc: "Expertise & CSR Match", icon: GitMerge, color: "text-emerald-600 bg-emerald-100/80" },
  { id: "COLLABORATE", label: "Project Workspace", desc: "Milestones & MVP", icon: Users, color: "text-blue-600 bg-blue-100/80" },
  { id: "DEPLOY", label: "Field Pilot", desc: "Municipal Deployment", icon: Rocket, color: "text-indigo-600 bg-indigo-100/80" },
  { id: "MEASURE", label: "Impact & Feedback", desc: "Closed-loop verification", icon: BarChart3, color: "text-teal-600 bg-teal-100/80" }
];

export default function EcosystemFlow({ activeStage = "SUBMIT" }: EcosystemFlowProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm overflow-x-auto my-6">
      <div className="flex items-center justify-between min-w-[760px] gap-2">
        {STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isActive = st.id === activeStage;
          return (
            <React.Fragment key={st.id}>
              <div className={`flex flex-col items-center text-center p-2.5 rounded-lg transition-all ${
                isActive ? "bg-slate-50 ring-2 ring-sky-600 scale-105 shadow-sm" : "hover:bg-slate-50 opacity-80"
              }`}>
                <div className={`p-2 rounded-lg mb-1.5 ${st.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">{st.label}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{st.desc}</span>
              </div>

              {idx < STAGES.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
