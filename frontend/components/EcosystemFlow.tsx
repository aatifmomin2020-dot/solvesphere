"use client";

import React from "react";
import { Send, Cpu, CheckCircle2, GitMerge, Users, Rocket, BarChart3, ChevronRight } from "lucide-react";

interface EcosystemFlowProps {
  activeStage?: string;
}

const STAGES = [
  { id: "SUBMIT", label: "Citizen Problem", desc: "Report challenge", icon: Send, color: "text-sky-500 bg-sky-50 dark:bg-sky-950/40" },
  { id: "ANALYZE", label: "AI Pipeline", desc: "Domain + Priority + Duplicates", icon: Cpu, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40" },
  { id: "VERIFY", label: "Government Review", desc: "Validation & Scoping", icon: CheckCircle2, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" },
  { id: "MATCH", label: "Uni + Industry AI", desc: "Expertise & CSR Match", icon: GitMerge, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" },
  { id: "COLLABORATE", label: "Project Workspace", desc: "Milestones & MVP", icon: Users, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40" },
  { id: "DEPLOY", label: "Field Pilot", desc: "Municipal Deployment", icon: Rocket, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" },
  { id: "MEASURE", label: "Impact & Feedback", desc: "Closed-loop verification", icon: BarChart3, color: "text-teal-500 bg-teal-50 dark:bg-teal-950/40" }
];

export default function EcosystemFlow({ activeStage = "SUBMIT" }: EcosystemFlowProps) {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl overflow-x-auto my-6">
      <div className="flex items-center justify-between min-w-[760px] gap-2">
        {STAGES.map((st, idx) => {
          const Icon = st.icon;
          const isActive = st.id === activeStage;
          return (
            <React.Fragment key={st.id}>
              <div className={`flex flex-col items-center text-center p-2.5 rounded-lg transition-all ${
                isActive ? "bg-slate-800 ring-2 ring-sky-500 scale-105" : "hover:bg-slate-800/50 opacity-80"
              }`}>
                <div className={`p-2 rounded-lg mb-1.5 ${st.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-100">{st.label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{st.desc}</span>
              </div>

              {idx < STAGES.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
