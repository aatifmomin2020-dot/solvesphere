"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import EcosystemFlow from "@/components/EcosystemFlow";
import { 
  Building2, GraduationCap, Building, Users, CheckCircle2, 
  Activity 
} from "lucide-react";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projId = (params?.id as string) || "SS-P-1042";

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    loadProject();
  }, [projId]);

  const loadProject = () => {
    setLoading(true);
    fetchApi(`/projects/${projId}`)
      .then((data) => setProject(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleUpdateMilestone = async (milestoneId: string, newStatus: string) => {
    setUpdatingMilestoneId(milestoneId);
    try {
      await fetchApi(`/projects/${projId}/milestones`, {
        method: "PATCH",
        body: JSON.stringify({ milestone_id: milestoneId, status: newStatus })
      });
      loadProject();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUpdatingMilestoneId(null);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs font-mono text-slate-500 animate-pulse">Loading collaborative project workspace...</div>;
  }

  if (!project) {
    return <div className="py-20 text-center text-xs text-rose-600 font-bold">Project not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
              PROJECT ID: {project.id}
            </span>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded">
              Status: {project.status}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">{project.title}</h1>
          <p className="text-xs text-slate-600">Addressing: {project.challenge?.title} ({project.challenge?.location})</p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-right font-mono">
          <span className="text-slate-500 block text-[10px]">Primary Domain:</span>
          <span className="font-bold text-sky-700">{project.challenge?.category}</span>
        </div>
      </div>

      <EcosystemFlow activeStage={project.status === "PILOT" ? "DEPLOY" : "COLLABORATE"} />

      {/* MULTI-STAKEHOLDER TEAM COLLABORATION CARD */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-600" />
          Multi-Stakeholder Project Team
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 font-bold mb-1">
              <Building2 className="w-4 h-4" />
              <span>Government Officer</span>
            </div>
            <p className="font-bold text-slate-900 text-xs">{project.team?.government_officer}</p>
            <p className="text-[10px] text-slate-500">Municipal Approval & Pilot Sanction</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>University Faculty</span>
            </div>
            <p className="font-bold text-slate-900 text-xs">{project.team?.faculty_advisor}</p>
            <p className="text-[10px] text-slate-500">{project.team?.university}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-sky-200 space-y-1">
            <div className="flex items-center gap-1.5 text-sky-700 font-bold mb-1">
              <Users className="w-4 h-4" />
              <span>Student Team</span>
            </div>
            <p className="font-bold text-slate-900 text-xs">{project.team?.student_team}</p>
            <p className="text-[10px] text-slate-500">Hardware & Software Engineering</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-purple-200 space-y-1">
            <div className="flex items-center gap-1.5 text-purple-700 font-bold mb-1">
              <Building className="w-4 h-4" />
              <span>Industry Mentor</span>
            </div>
            <p className="font-bold text-slate-900 text-xs">{project.team?.industry_partner}</p>
            <p className="text-[10px] text-slate-500">IoT Sensors & Telemetry Grant</p>
          </div>

        </div>
      </div>

      {/* INTERACTIVE MILESTONE TIMELINE */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Project Execution Milestones & Deliverables
          </h2>
          <span className="text-xs font-mono text-slate-500">Click actions to advance workflow state</span>
        </div>

        <div className="space-y-4">
          {project.milestones?.map((m: any, idx: number) => {
            const isDone = m.status === "COMPLETED";
            const isInProgress = m.status === "IN_PROGRESS";

            return (
              <div
                key={m.id}
                className={`p-5 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isDone
                    ? "bg-slate-50 border-emerald-300"
                    : isInProgress
                    ? "bg-slate-50 border-amber-300 ring-1 ring-amber-300/40"
                    : "bg-slate-50/60 border-slate-200 opacity-80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl font-mono text-xs font-bold mt-0.5 ${
                    isDone ? "bg-emerald-100 text-emerald-800" : isInProgress ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"
                  }`}>
                    0{idx + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white ${
                        isDone ? "bg-emerald-600" : isInProgress ? "bg-amber-600" : "bg-slate-400"
                      }`}>
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{m.description}</p>
                    <span className="text-[10px] font-mono text-slate-500 block">Stage: {m.stage} • Due: {m.due_date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isDone && (
                    <button
                      onClick={() => handleUpdateMilestone(m.id, "COMPLETED")}
                      disabled={updatingMilestoneId === m.id}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      {updatingMilestoneId === m.id ? "Updating..." : "Mark Completed ✓"}
                    </button>
                  )}
                  {isDone && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delivered
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IMPACT SNAPSHOT */}
      {project.impact_metrics && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold text-slate-900">Live Pilot Impact Metrics</h2>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
              Demo Data
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-medium">Monthly Incidents</span>
              <span className="text-2xl font-black text-sky-700">{project.impact_metrics.incidents_before} → {project.impact_metrics.incidents_after}</span>
              <span className="text-[10px] text-emerald-700 font-bold block">{project.impact_metrics.reduction_percent}% Reduction</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-medium">Response Time</span>
              <span className="text-2xl font-black text-emerald-700">{project.impact_metrics.response_time_after_hours} hrs</span>
              <span className="text-[10px] text-slate-500 block">Before: {project.impact_metrics.response_time_before_hours} hrs</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-medium">Citizens Benefited</span>
              <span className="text-2xl font-black text-amber-700">{project.impact_metrics.citizens_affected?.toLocaleString()}</span>
              <span className="text-[10px] text-slate-500 block">ABC School Junction</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-medium">Citizen Satisfaction</span>
              <span className="text-2xl font-black text-purple-700">{project.impact_metrics.user_satisfaction_percent}%</span>
              <span className="text-[10px] text-slate-500 block">Post-Pilot Survey</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
