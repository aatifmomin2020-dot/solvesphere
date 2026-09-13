import React, { useEffect, useState } from 'react';
import { Layers, CheckCircle2, Clock, ShieldCheck, GraduationCap, Building2, Users, FileText, Activity } from 'lucide-react';

export const ProjectWorkspacePage: React.FC = () => {
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/projects')
      .then((res) => res.json())
      .then((projs) => {
        if (projs.length > 0) {
          return fetch(`/api/v1/projects/${projs[0].id}`);
        }
        throw new Error("No projects found");
      })
      .then((res) => res.json())
      .then((data) => {
        setWorkspace(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Project Workspace...</div>;

  const proj = workspace?.project || {};
  const ch = workspace?.challenge || {};
  const milestones = workspace?.milestones || [];
  const impact = workspace?.impact || {};
  const partnerships = workspace?.partnerships || [];

  const stages = ['PROPOSED', 'APPROVED', 'ACTIVE', 'PROTOTYPE', 'PILOT', 'VALIDATION', 'DEPLOYED', 'CLOSED'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">{ch.public_code || 'SS-1042'}</span>
              <span className="text-xs font-semibold text-slate-500">{ch.domain}</span>
              <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase">
                Stage: {proj.stage || 'DEPLOYED'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{proj.title || 'Project HydroSolve'}</h1>
            <p className="text-xs text-slate-500 mt-1">Multi-Stakeholder Innovation Workspace (Government + University + Industry)</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center shrink-0">
            <span className="text-xs text-emerald-700 font-semibold block">Overall Progress</span>
            <strong className="text-3xl font-extrabold text-emerald-600 block">{proj.progress_percentage || 100}%</strong>
          </div>
        </div>

        {/* 8-Stage Pipeline Stepper */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Project Lifecycle Stage Pipeline</span>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {stages.map((stg, idx) => {
              const active = proj.stage === stg;
              return (
                <div
                  key={stg}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {idx + 1}. {stg}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stakeholder Tripartite Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stakeholder 1: Government */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Government Sponsor</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">Dept. of Urban Infrastructure</h3>
          <p className="text-xs text-slate-500">Priya Patel (Gov Reviewer) — Verified & Approved SLA Workflow</p>
        </div>

        {/* Stakeholder 2: University */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-bold uppercase">
            <GraduationCap className="w-4 h-4" />
            <span>University R&D Team</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">ABC Institute of Tech (Team HydroSolve)</h3>
          <p className="text-xs text-slate-500">Prof. V. Malhotra (Mentor) + Rohan Gupta (Student Lead)</p>
        </div>

        {/* Stakeholder 3: Industry */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-amber-600 text-xs font-bold uppercase">
            <Building2 className="w-4 h-4" />
            <span>Industry Partner</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">SmartCity Technologies Ltd</h3>
          <p className="text-xs text-slate-500">Contribution: ₹150,000 Funding + IoT Hardware & Field Support</p>
        </div>
      </div>

      {/* Milestones & Deliverables */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Project Milestones & Deliverable Evidence</h3>
        <div className="divide-y divide-slate-100">
          {milestones.map((m: any) => (
            <div key={m.id} className="py-4 flex justify-between items-center text-xs">
              <div className="space-y-1">
                <strong className="text-sm font-bold text-slate-900 block">{m.sequence_order}. {m.title}</strong>
                <span className="text-slate-500">Status: <strong className="text-emerald-600 font-semibold">{m.status}</strong></span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-bold text-slate-900">{m.completion_percentage}% Completed</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Outcomes Display (Section 51 & 57) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h3 className="text-xl font-extrabold text-white">Measurable Impact Outcomes</h3>
          <span className="text-xs text-slate-400 italic">Labelled: DEMO / SIMULATED DATA</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block">People Reached</span>
            <strong className="text-2xl font-extrabold text-sky-400 block mt-1">{impact.people_reached || 2450}</strong>
          </div>
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block">Waterlogging Incident Reduction</span>
            <strong className="text-2xl font-extrabold text-emerald-400 block mt-1">{impact.incident_reduction_percentage || 78}%</strong>
          </div>
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block">Commute Hours Saved / Month</span>
            <strong className="text-2xl font-extrabold text-amber-400 block mt-1">{impact.time_saved_hours_per_month || 160} Hrs</strong>
          </div>
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700">
            <span className="text-slate-400 block">Estimated Cost Savings</span>
            <strong className="text-2xl font-extrabold text-indigo-300 block mt-1">₹{(impact.cost_saved_inr || 450000).toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
